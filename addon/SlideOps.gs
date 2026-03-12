// Slide mutation operations — all Google Slides API access goes here

var SlideOps = (function () {
  /**
   * Insert a template slide after the current slide in the active presentation.
   * @param {Object} payload - { templateKey: string, values: Record<string, string> }
   * @returns {{ slideObjectId: string }}
   */
  function insertTemplateSlide(payload) {
    var templateKey = payload.templateKey;
    var values = payload.values || {};

    // Validate required fields
    var templateDef = _getTemplateDef(templateKey);
    for (var i = 0; i < templateDef.fields.length; i++) {
      var field = templateDef.fields[i];
      if (field.required && !values[field.name]) {
        throw new Error('Missing required field: ' + field.name);
      }
    }

    var templatePresentationId =
      PropertiesService.getScriptProperties().getProperty(
        'TEMPLATE_PRESENTATION_ID'
      );
    if (!templatePresentationId) {
      throw new Error('TEMPLATE_PRESENTATION_ID not set in Script Properties');
    }

    // Find the template slide in the source deck
    var templatePresentation = SlidesApp.openById(templatePresentationId);
    var templateSlide = _findTemplateSlide(templatePresentation, templateKey);
    if (!templateSlide) {
      throw new Error('Template slide not found for key: ' + templateKey);
    }

    // Determine insert position in the active presentation
    var activePresentation = SlidesApp.getActivePresentation();
    var selection = activePresentation.getSelection();
    var insertIndex = activePresentation.getSlides().length; // default: append

    try {
      var currentPage = selection.getCurrentPage();
      var slides = activePresentation.getSlides();
      for (var j = 0; j < slides.length; j++) {
        if (slides[j].getObjectId() === currentPage.getObjectId()) {
          insertIndex = j + 1;
          break;
        }
      }
    } catch (e) {
      // No selection — append to end
    }

    // Copy template slide into active presentation
    var inserted = activePresentation.insertSlide(insertIndex, templateSlide);

    // Replace text placeholders: {{FIELD_NAME_UPPERCASE}}
    var textFields = templateDef.fields.filter(function (f) {
      return f.type === 'text';
    });
    for (var k = 0; k < textFields.length; k++) {
      var fieldName = textFields[k].name;
      var placeholder = '{{' + fieldName.toUpperCase() + '}}';
      var val = values[fieldName] || '';
      inserted.replaceAllText(placeholder, val);
    }

    // Replace image placeholders: shapes/images with alt-text "slot:field_name"
    var imageFields = templateDef.fields.filter(function (f) {
      return f.type === 'image';
    });
    for (var m = 0; m < imageFields.length; m++) {
      var imgFieldName = imageFields[m].name;
      var imgUrl = values[imgFieldName];
      if (!imgUrl) continue;
      _replaceImagePlaceholder(inserted, imgFieldName, imgUrl);
    }

    return { slideObjectId: inserted.getObjectId() };
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  /**
   * Get template definition from script properties or hardcoded fallback.
   * In v1 the definitions are inlined here; a future version can fetch from the backend.
   */
  function _getTemplateDef(templateKey) {
    var defs = {
      A: {
        fields: [
          { name: 'text', type: 'text', required: true },
          { name: 'img_url', type: 'image', required: true },
        ],
      },
      B: {
        fields: [
          { name: 'text1', type: 'text', required: true },
          { name: 'text2', type: 'text', required: true },
          { name: 'text3', type: 'text', required: false },
        ],
      },
    };
    var def = defs[templateKey];
    if (!def) throw new Error('Unknown template key: ' + templateKey);
    return def;
  }

  /**
   * Find a slide in a presentation whose speaker notes contain "template_key: X".
   */
  function _findTemplateSlide(presentation, templateKey) {
    var slides = presentation.getSlides();
    for (var i = 0; i < slides.length; i++) {
      var notes = slides[i]
        .getNotesPage()
        .getSpeakerNotesShape()
        .getText()
        .asString();
      if (notes.indexOf('template_key: ' + templateKey) !== -1) {
        return slides[i];
      }
    }
    return null;
  }

  /**
   * Find an image on the slide with alt-text "slot:field_name" and replace it
   * in place so the existing element styling is preserved.
   */
  function _replaceImagePlaceholder(slide, fieldName, imageUrl) {
    var slotTag = 'slot:' + fieldName;
    var elements = slide.getPageElements();
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      try {
        if (el.getDescription && el.getDescription() === slotTag) {
          if (el.getPageElementType() !== SlidesApp.PageElementType.IMAGE) {
            throw new Error(
              'Placeholder "' +
                slotTag +
                '" must be an image element to preserve styling'
            );
          }

          el.asImage().replace(imageUrl, true);
          return;
        }
      } catch (e) {
        if (
          String(e).indexOf(
            'Placeholder "' + slotTag + '" must be an image element'
          ) !== -1
        ) {
          throw e;
        }
        // Some element types do not support descriptions or image replacement; skip.
      }
    }

    throw new Error('Image placeholder not found for field: ' + fieldName);
  }

  return { insertTemplateSlide: insertTemplateSlide };
})();
