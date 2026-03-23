import { chromium } from 'playwright';
import type { Browser } from 'playwright';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const designSystemCss = readFileSync(
  join(__dirname, 'design-system.css'),
  'utf-8'
);

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch();
  }
  return browser;
}

process.on('exit', () => {
  browser?.close();
});

export async function renderSlide(html: string, css: string): Promise<string> {
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
${designSystemCss}
${css}
  </style>
</head>
<body>
<div class="slide">
${html}
</div>
</body>
</html>`;

  const b = await getBrowser();
  const page = await b.newPage();
  try {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.setContent(fullHtml, { waitUntil: 'load' });
    const screenshot = await page.screenshot({ type: 'png' });
    return screenshot.toString('base64');
  } finally {
    await page.close();
  }
}
