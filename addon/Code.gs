// Add-on entry point and sidebar management

function getBackendUrl() {
  return (
    PropertiesService.getScriptProperties().getProperty('BACKEND_BASE_URL') ||
    'https://localhost:5173'
  );
}

function onOpen() {
  SlidesApp.getUi()
    .createMenu('Decks')
    .addItem('Open sidebar', 'showSidebar')
    .addToUi();
}

function showSidebar() {
  var tmpl = HtmlService.createTemplateFromFile('Sidebar');
  var html = tmpl.evaluate().setTitle('Decks').setWidth(300);
  SlidesApp.getUi().showSidebar(html);
}

/**
 * Called by the iframe bridge to verify postMessage works.
 */
function testBridge() {
  Logger.log('testBridge called — iframe/postMessage bridge is working');
  return { ok: true };
}

/**
 * Insert a template slide into the active presentation.
 * Receives { templateKey, values } from the iframe via the postMessage bridge.
 */
function insertTemplateSlide(payload) {
  return SlideOps.insertTemplateSlide(payload);
}

/**
 * Discover template definitions directly from the template deck.
 * Returns TemplateDefinition[] by scanning slide speaker notes and placeholders.
 */
function discoverTemplates() {
  return SlideOps.discoverTemplates();
}

/**
 * Upload an image (base64) and return a URL for use in slide insertion.
 * Currently tries a data URI — if that doesn't work with the Slides API,
 * we'll switch to the temp-slide approach.
 */
function uploadImage(payload) {
  return SlideOps.uploadImage(payload);
}

function getCurrentSlideId() {
  return SlideOps.getCurrentSlideId();
}

function updateSlideImage(payload) {
  return SlideOps.updateSlideImage(payload);
}

function updateSlideText(payload) {
  return SlideOps.updateSlideText(payload);
}

function finalizeSlide(payload) {
  return SlideOps.finalizeSlide(payload);
}

function updateSlideFieldText(payload) {
  return BatchEditOps.updateSlideFieldText(payload);
}

function getSelectedSlidesMetadata() {
  return BatchEditOps.getSelectedSlidesMetadata();
}

/**
 * Returns the currently configured template presentation ID, or null if not set.
 */
function getTemplatePresentationId() {
  return (
    PropertiesService.getScriptProperties().getProperty(
      'TEMPLATE_PRESENTATION_ID'
    ) || null
  );
}

/**
 * Saves the template presentation ID to Script Properties.
 * Receives { id: string } from the iframe via the postMessage bridge.
 */
function setTemplatePresentationId(payload) {
  PropertiesService.getScriptProperties().setProperty(
    'TEMPLATE_PRESENTATION_ID',
    payload.id
  );
  return { ok: true };
}
