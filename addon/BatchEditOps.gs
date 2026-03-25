// Batch edit operations — reading selected slides and updating fields by marker

var BatchEditOps = (function () {
  /**
   * Update a text field on a slide by finding all elements marked with
   * the field: description and calling setText() on each.
   * @param {Object} payload - { slideObjectId: string, fieldName: string, newValue: string }
   */
  function updateSlideFieldText(payload) {
    var slide = _findSlideById(payload.slideObjectId);
    if (!slide) throw new Error('Slide not found: ' + payload.slideObjectId);
    var targetDesc = FIELD_MARKER_PREFIX + payload.fieldName;
    var elements = slide.getPageElements();
    var updated = false;
    for (var i = 0; i < elements.length; i++) {
      try {
        var d = elements[i].getDescription ? elements[i].getDescription() : '';
        if (d === targetDesc) {
          elements[i].asShape().getText().setText(payload.newValue);
          updated = true;
        }
      } catch (e) {
        // skip elements that don't support description or shape access
      }
    }
    if (!updated) {
      throw new Error(
        'No element found with field marker: ' + payload.fieldName
      );
    }
  }

  /**
   * Get metadata for all currently selected slides in the filmstrip.
   * Returns only slides that have a template_key in their speaker notes.
   * Results are ordered by deck position.
   * @returns {Array<{ slideObjectId: string, templateKey: string, fields: Object }>}
   */
  function getSelectedSlidesMetadata() {
    var pres = SlidesApp.getActivePresentation();
    var selection = pres.getSelection();
    var pages = [];

    try {
      var range = selection.getPageRange();
      pages = range.getPages();
    } catch (e) {
      try {
        var current = selection.getCurrentPage();
        if (current) pages = [current];
      } catch (e2) {
        // no selection — return empty
      }
    }

    // Normalize to deck order rather than selection order
    var selectedIds = {};
    for (var i = 0; i < pages.length; i++) {
      selectedIds[pages[i].getObjectId()] = true;
    }
    var allSlides = pres.getSlides();
    var ordered = [];
    for (var j = 0; j < allSlides.length; j++) {
      if (selectedIds[allSlides[j].getObjectId()]) {
        ordered.push(allSlides[j]);
      }
    }

    var results = [];
    for (var k = 0; k < ordered.length; k++) {
      var slide = ordered[k];
      var notes = slide
        .getNotesPage()
        .getSpeakerNotesShape()
        .getText()
        .asString();
      var templateKey = _parseNoteValue(notes, 'template_key');
      if (!templateKey) continue; // skip non-template slides
      var fields = _readSlideFieldValues(slide);
      results.push({
        slideObjectId: slide.getObjectId(),
        templateKey: templateKey,
        fields: fields,
      });
    }
    return results;
  }

  return {
    updateSlideFieldText: updateSlideFieldText,
    getSelectedSlidesMetadata: getSelectedSlidesMetadata,
  };
})();
