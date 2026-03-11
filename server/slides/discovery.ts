import type { slides_v1 } from 'googleapis';
import { MANIFEST } from './manifest.js';

export interface TemplateSlideInfo {
  slideObjectId: string;
  imageSlots: Map<string, string>;
}

export async function discoverTemplateSlides(
  slides: slides_v1.Slides,
  presentationId: string
): Promise<Map<string, TemplateSlideInfo>> {
  const { data } = await slides.presentations.get({ presentationId });

  const result = new Map<string, TemplateSlideInfo>();

  for (const slide of data.slides ?? []) {
    const notesElements = slide.slideProperties?.notesPage?.pageElements ?? [];
    let notesText = '';
    for (const pageElement of notesElements) {
      if (pageElement.shape?.placeholder?.type === 'BODY') {
        for (const textElement of pageElement.shape.text?.textElements ?? []) {
          if (textElement.textRun?.content) {
            notesText += textElement.textRun.content;
          }
        }
      }
    }

    let templateKey: string | null = null;
    for (const line of notesText.split('\n')) {
      const match = line.trim().match(/^template_key:\s*(\S+)$/);
      if (match) {
        templateKey = match[1];
        break;
      }
    }

    if (!templateKey) continue;

    const imageSlots = new Map<string, string>();
    for (const pageElement of slide.pageElements ?? []) {
      const description = pageElement.description ?? '';
      const slotMatch = description.match(/^slot:(.+)$/);
      if (slotMatch && pageElement.objectId) {
        imageSlots.set(slotMatch[1], pageElement.objectId);
      }
    }

    result.set(templateKey, {
      slideObjectId: slide.objectId!,
      imageSlots,
    });
  }

  for (const template of MANIFEST) {
    if (!result.has(template.templateKey)) {
      throw new Error(
        `Template slide not found in presentation for template key: "${template.templateKey}"`
      );
    }
  }

  return result;
}
