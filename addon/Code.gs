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
