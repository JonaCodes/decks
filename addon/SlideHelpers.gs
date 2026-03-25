// Private helpers shared across SlideOps — loaded before SlideOps.gs.
// All functions are global (Apps Script shares one scope across .gs files).

var FIELD_MARKER_PREFIX = 'field:';
var SLOT_MARKER_PREFIX = 'slot:';

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
 * Parse the description field from speaker notes, supporting multiple lines.
 * Since description is always the last field, everything from the "description:"
 * line to the end of the notes is captured.
 */
function _parseDescription(notes) {
  var lines = notes.split('\n');
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].trim().indexOf('description:') === 0) {
      var firstLine = lines[i].slice(lines[i].indexOf(':') + 1).trim();
      var rest = lines
        .slice(i + 1)
        .join('\n')
        .trim();
      var full = rest
        ? firstLine
          ? firstLine + '\n' + rest
          : rest
        : firstLine;
      return full || null;
    }
  }
  return null;
}

/**
 * Discover fields from a single template slide by scanning its elements.
 * - Text elements containing {{FIELD}} → required text field
 * - Text elements containing {{?FIELD}} → optional text field
 * - Page elements with description "slot:field_name" → required image field
 * - Page elements with description "slot:?field_name" → optional image field
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
        var optional = desc.charAt(5) === '?';
        var imgField = desc.slice(optional ? 6 : 5).trim();
        if (imgField && !seen[imgField]) {
          seen[imgField] = true;
          fields.push({ name: imgField, type: 'image', required: !optional });
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
          var reqName = reqMatches[ri].replace(/\{\{|\}\}/g, '').toLowerCase();
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
 * Find an image placeholder on the slide with alt-text "slot:field_name" or
 * "slot:?field_name" and remove it. Used for optional image fields left empty.
 * Silently does nothing if the element is not found.
 */
function _removeImagePlaceholder(slide, fieldName) {
  var elements = slide.getPageElements();
  for (var i = 0; i < elements.length; i++) {
    var el = elements[i];
    try {
      var d = el.getDescription ? el.getDescription() : '';
      if (d === 'slot:' + fieldName || d === 'slot:?' + fieldName) {
        el.remove();
        return;
      }
    } catch (e) {
      /* skip */
    }
  }
}

/**
 * Find a slide in the active presentation by its objectId.
 * Returns null if not found.
 */
function _findSlideById(slideObjectId) {
  var slides = SlidesApp.getActivePresentation().getSlides();
  for (var i = 0; i < slides.length; i++) {
    if (slides[i].getObjectId() === slideObjectId) {
      return slides[i];
    }
  }
  return null;
}

/**
 * Read current field values from a slide by scanning page elements for
 * field: and slot: description markers.
 * - field:name → text field; value is current text (placeholder text normalized to '')
 * - slot:name / slot:?name → image field; value is '' (image batch edit deferred)
 * If the same field name appears on multiple elements, the first occurrence wins.
 * @returns {Object} Record<string, { type: 'text'|'image', value: string }>
 */
function _readSlideFieldValues(slide) {
  var result = {};
  var elements = slide.getPageElements();

  for (var i = 0; i < elements.length; i++) {
    var el = elements[i];
    var desc = '';
    try {
      desc = el.getDescription ? el.getDescription() : '';
    } catch (e) {
      continue;
    }

    if (desc && desc.indexOf(FIELD_MARKER_PREFIX) === 0) {
      var fieldName = desc.slice(FIELD_MARKER_PREFIX.length).trim();
      if (fieldName && !result[fieldName]) {
        var value = '';
        try {
          var text = el.asShape().getText().asString();
          text = text.replace(/\n$/, ''); // trim trailing newline asString() appends
          // Normalize unfilled placeholder text to empty string
          if (/^\{\{\??[A-Z0-9_]+\}\}$/.test(text.trim())) {
            text = '';
          }
          value = text;
        } catch (e) {
          // Element not accessible as shape; leave value empty
        }
        result[fieldName] = { type: 'text', value: value };
      }
    } else if (desc && desc.indexOf(SLOT_MARKER_PREFIX) === 0) {
      var slotSuffix = desc.slice(SLOT_MARKER_PREFIX.length);
      var imgField =
        slotSuffix.charAt(0) === '?'
          ? slotSuffix.slice(1).trim()
          : slotSuffix.trim();
      if (imgField && !result[imgField]) {
        result[imgField] = { type: 'image', value: '' };
      }
    }
  }

  return result;
}

/**
 * Find an image on the slide with alt-text "slot:field_name" or
 * "slot:?field_name" and replace it in place so existing element styling is
 * preserved.
 */
function _replaceImagePlaceholder(slide, fieldName, imageUrl) {
  var slotTag = SLOT_MARKER_PREFIX + fieldName;
  var elements = slide.getPageElements();
  for (var i = 0; i < elements.length; i++) {
    var el = elements[i];
    var matched = false;
    try {
      var d = el.getDescription ? el.getDescription() : '';
      matched = d === slotTag || d === SLOT_MARKER_PREFIX + '?' + fieldName;
    } catch (e) {
      // Some element types do not support getDescription; skip.
      continue;
    }
    if (!matched) continue;

    // Element matched — any error from here is a real failure, not a skip.
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

  throw new Error('Image placeholder not found for field: ' + fieldName);
}
