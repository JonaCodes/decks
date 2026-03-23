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
      var description = _parseDescription(notes) || '';
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

    // Validate required fields by discovering them from the template slide.
    // Image fields are exempt: their placeholders stay in place for post-insert editing.
    var fields = _discoverSlideFields(templateSlide);
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.required && field.type !== 'image' && values[field.name] == null) {
        throw new Error('Missing required field: ' + field.name);
      }
    }

    // Determine insert position in the active presentation
    var activePresentation = SlidesApp.getActivePresentation();
    var insertIndex = activePresentation.getSlides().length; // default: append

    if (!payload.appendToEnd) {
      var selection = activePresentation.getSelection();
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
    }

    // Copy template slide into active presentation
    var inserted = activePresentation.insertSlide(insertIndex, templateSlide);

    // Replace text placeholders: {{FIELD_NAME_UPPERCASE}} or {{?FIELD_NAME_UPPERCASE}}
    // Only replace when a value is provided — leave placeholder text intact for post-insert editing.
    var textFields = fields.filter(function (f) {
      return f.type === 'text';
    });
    for (var k = 0; k < textFields.length; k++) {
      var fieldName = textFields[k].name;
      var val = values[fieldName];
      if (val) {
        inserted.replaceAllText('{{' + fieldName.toUpperCase() + '}}', val);
        inserted.replaceAllText('{{?' + fieldName.toUpperCase() + '}}', val);
      }
    }

    // Replace image placeholders: shapes/images with alt-text "slot:field_name"
    // Only replace when a URL is provided — leave placeholder image in place for post-insert editing.
    var imageFields = fields.filter(function (f) {
      return f.type === 'image';
    });
    for (var m = 0; m < imageFields.length; m++) {
      var imgFieldName = imageFields[m].name;
      var imgUrl = values[imgFieldName];
      if (imgUrl) {
        _replaceImagePlaceholder(inserted, imgFieldName, imgUrl);
      }
    }

    return { slideObjectId: inserted.getObjectId() };
  }

  /**
   * Upload an image by embedding it in a temp slide and reading back the
   * Google-hosted content URL. The temp slide is deleted immediately after.
   * @param {Object} payload - { base64Data: string, mimeType: string }
   * @returns {{ url: string }}
   */
  function uploadImage(payload) {
    var base64Data = payload.base64Data;
    var mimeType = payload.mimeType || 'image/png';

    if (!base64Data) {
      throw new Error('No image data provided');
    }
    // ~5MB limit: base64 is ~4/3x the raw size, so 5MB raw ≈ 6.7MB base64
    if (base64Data.length > 7 * 1024 * 1024) {
      throw new Error('Image too large (max 5MB)');
    }

    var blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      mimeType,
      'paste.png'
    );

    var pres = SlidesApp.getActivePresentation();
    var tempSlide = pres.appendSlide();
    var img = tempSlide.insertImage(blob);

    // getContentUrl() is synchronous within SlidesApp — no REST API needed
    var contentUrl = img.getContentUrl();

    // Clean up temp slide before returning
    tempSlide.remove();

    if (!contentUrl) {
      throw new Error('Failed to retrieve image content URL');
    }
    return { url: contentUrl };
  }

  function getCurrentSlideId() {
    try {
      var page = SlidesApp.getActivePresentation().getSelection().getCurrentPage();
      return { slideObjectId: page ? page.getObjectId() : null };
    } catch (e) {
      return { slideObjectId: null };
    }
  }

  function updateSlideImage(payload) {
    var slide = _findSlideById(payload.slideObjectId);
    if (!slide) throw new Error('Slide not found: ' + payload.slideObjectId);
    _replaceImagePlaceholder(slide, payload.fieldName, payload.imageUrl);
  }

  function updateSlideText(payload) {
    var slide = _findSlideById(payload.slideObjectId);
    if (!slide) throw new Error('Slide not found: ' + payload.slideObjectId);
    if (payload.oldValue) {
      slide.replaceAllText(payload.oldValue, payload.newValue);
    } else {
      // Field was never filled — placeholder text is still on the slide
      var upper = payload.fieldName.toUpperCase();
      slide.replaceAllText('{{' + upper + '}}', payload.newValue);
      slide.replaceAllText('{{?' + upper + '}}', payload.newValue);
    }
  }

  function finalizeSlide(payload) {
    var slide = _findSlideById(payload.slideObjectId);
    if (!slide) return;
    var unfilledText = payload.unfilledTextFields || [];
    var unfilledImages = payload.unfilledImageFields || [];
    for (var i = 0; i < unfilledText.length; i++) {
      var upper = unfilledText[i].toUpperCase();
      slide.replaceAllText('{{' + upper + '}}', '');
      slide.replaceAllText('{{?' + upper + '}}', '');
    }
    for (var j = 0; j < unfilledImages.length; j++) {
      _removeImagePlaceholder(slide, unfilledImages[j]);
    }
  }

  return {
    insertTemplateSlide: insertTemplateSlide,
    discoverTemplates: discoverTemplates,
    uploadImage: uploadImage,
    getCurrentSlideId: getCurrentSlideId,
    updateSlideImage: updateSlideImage,
    updateSlideText: updateSlideText,
    finalizeSlide: finalizeSlide,
  };
})();
