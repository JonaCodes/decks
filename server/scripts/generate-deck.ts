import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { generatePresentation } from '../slides/generate.js';
import type { SlidePayload } from '../slides/manifest.js';

dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env'),
});

const templatePresentationId = process.env.TEMPLATE_PRESENTATION_ID;

if (!templatePresentationId) {
  throw new Error('TEMPLATE_PRESENTATION_ID env var is required');
}

const slides: SlidePayload[] = [
  {
    slide_template: 'A',
    text: 'Hello World',
    img_url:
      'https://vetforcatsonly.com/wp-content/uploads/2019/12/IMG_0579-300x225-1.jpg',
  },
  {
    slide_template: 'B',
    text1: 'Point one',
    text2: 'Point two',
    text3: 'Point three',
  },
  {
    slide_template: 'A',
    text: 'Second image slide',
    img_url:
      'https://i.etsystatic.com/21677388/r/il/6e9965/2999089305/il_fullxfull.2999089305_t4w8.jpg',
  },
];

(async () => {
  try {
    const result = await generatePresentation({
      templatePresentationId,
      outputTitle: 'Generated Deck - Test 2',
      slides,
    });
    console.log('Generated presentation:', result.url);
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
})();
