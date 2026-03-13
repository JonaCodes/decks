// Slide mutation operations — all Google Slides API access goes here

var SlideOps = (function () {
  /**
   * Discover all template definitions by scanning the template deck.
   * Reads speaker notes for template_key/name/description and scans slide
   * elements for {{FIELD}} text placeholders and slot:field image placeholders.
   * @returns {Array<{ templateKey: string, name: string, description: string, fields: Array }>}
   */
  function discoverTemplates() {
    var templatePresentationId =
      PropertiesService.getScriptProperties().getProperty(
        'TEMPLATE_PRESENTATION_ID'
      );
    if (!templatePresentationId) {
      throw new Error('TEMPLATE_PRESENTATION_ID not set in Script Properties');
    }

    var templatePresentation = SlidesApp.openById(templatePresentationId);
    var slides = templatePresentation.getSlides();
    var results = [];

    for (var i = 0; i < slides.length; i++) {
      var notes = slides[i]
        .getNotesPage()
        .getSpeakerNotesShape()
        .getText()
        .asString();

      var templateKey = _parseNoteValue(notes, 'template_key');
      if (!templateKey) continue;

      var name = _parseNoteValue(notes, 'name') || templateKey;
      var description = _parseNoteValue(notes, 'description') || '';
      var fields = _discoverSlideFields(slides[i]);

      var thumbnailUrl = null;
      try {
        var cache = CacheService.getScriptCache();
        var cacheKey = 'thumb_' + slides[i].getObjectId();
        var cached = cache.get(cacheKey);
        if (cached) {
          thumbnailUrl = cached;
        } else {
          var thumb = Slides.Presentations.Pages.getThumbnail(
            templatePresentationId,
            slides[i].getObjectId(),
            { 'thumbnailProperties.thumbnailSize': 'MEDIUM' }
          );
          if (thumb.contentUrl) {
            var imgResponse = UrlFetchApp.fetch(thumb.contentUrl);
            var base64 = Utilities.base64Encode(imgResponse.getContent());
            thumbnailUrl = 'data:image/png;base64,' + base64;
            cache.put(cacheKey, thumbnailUrl, 86400); // 24 hours
          }
        }
      } catch (e) {
        Logger.log('Thumbnail fetch failed for ' + templateKey + ': ' + e);
      }

      results.push({
        templateKey: templateKey,
        name: name,
        description: description,
        fields: fields,
        thumbnailUrl: thumbnailUrl,
      });
    }

    return results;
  }

  /**
   * Insert a template slide after the current slide in the active presentation.
   * @param {Object} payload - { templateKey: string, values: Record<string, string> }
   * @returns {{ slideObjectId: string }}
   */
  function insertTemplateSlide(payload) {
    var templateKey = payload.templateKey;
    var values = payload.values || {};

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

    // Validate required fields by discovering them from the template slide
    var fields = _discoverSlideFields(templateSlide);
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.required && !values[field.name]) {
        throw new Error('Missing required field: ' + field.name);
      }
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

    // Replace text placeholders: {{FIELD_NAME_UPPERCASE}} or {{?FIELD_NAME_UPPERCASE}}
    var textFields = fields.filter(function (f) {
      return f.type === 'text';
    });
    for (var k = 0; k < textFields.length; k++) {
      var fieldName = textFields[k].name;
      var val = values[fieldName] || '';
      // Replace both required {{FIELD}} and optional {{?FIELD}} variants
      inserted.replaceAllText('{{' + fieldName.toUpperCase() + '}}', val);
      inserted.replaceAllText('{{?' + fieldName.toUpperCase() + '}}', val);
    }

    // Replace image placeholders: shapes/images with alt-text "slot:field_name"
    var imageFields = fields.filter(function (f) {
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
   * Parse a "key: value" line from speaker notes text.
   * Returns the trimmed value string, or null if not found.
   */
  function _parseNoteValue(notes, key) {
    var lines = notes.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      var prefix = key + ':';
      if (line.indexOf(prefix) === 0) {
        return line.slice(prefix.length).trim() || null;
      }
    }
    return null;
  }

  /**
   * Discover fields from a single template slide by scanning its elements.
   * - Text elements containing {{FIELD}} → required text field
   * - Text elements containing {{?FIELD}} → optional text field
   * - Page elements with description "slot:field_name" → required image field
   * Returns deduplicated array of { name, type, required }.
   */
  function _discoverSlideFields(slide) {
    var fields = [];
    var seen = {};
    var elements = slide.getPageElements();

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];

      // Check for image slot via description
      try {
        var desc = el.getDescription ? el.getDescription() : '';
        if (desc && desc.indexOf('slot:') === 0) {
          var imgField = desc.slice('slot:'.length).trim();
          if (imgField && !seen[imgField]) {
            seen[imgField] = true;
            fields.push({ name: imgField, type: 'image', required: true });
          }
        }
      } catch (e) {
        // Some element types don't support getDescription; skip.
      }

      // Check for text placeholders in text content
      try {
        var shape = el.asShape ? el.asShape() : null;
        if (shape) {
          var text = shape.getText().asString();
          // Match {{?FIELD}} (optional) — must check before required pattern
          var optMatches = text.match(/\{\{\?([A-Z0-9_]+)\}\}/gi) || [];
          for (var oi = 0; oi < optMatches.length; oi++) {
            var optName = optMatches[oi]
              .replace(/\{\{\?|\}\}/g, '')
              .toLowerCase();
            if (!seen[optName]) {
              seen[optName] = true;
              fields.push({ name: optName, type: 'text', required: false });
            }
          }
          // Match {{FIELD}} (required)
          var reqMatches = text.match(/\{\{([A-Z0-9_]+)\}\}/gi) || [];
          for (var ri = 0; ri < reqMatches.length; ri++) {
            var reqName = reqMatches[ri]
              .replace(/\{\{|\}\}/g, '')
              .toLowerCase();
            if (!seen[reqName]) {
              seen[reqName] = true;
              fields.push({ name: reqName, type: 'text', required: true });
            }
          }
        }
      } catch (e) {
        // Element is not a shape or has no text; skip.
      }
    }

    return fields;
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

  return {
    insertTemplateSlide: insertTemplateSlide,
    discoverTemplates: discoverTemplates,
  };
})();
