import type { slides_v1 } from 'googleapis';
import { validateSlidePayload, getTemplate } from './manifest.js';
import type { TemplateSlideInfo } from './discovery.js';
import type { SlidePayload } from './manifest.js';

export function buildBatchUpdateRequests(
  payloads: SlidePayload[],
  templateMap: Map<string, TemplateSlideInfo>
): slides_v1.Schema$Request[] {
  const requests: slides_v1.Schema$Request[] = [];

  // Validation
  for (const payload of payloads) {
    validateSlidePayload(payload);
  }

  // Phase 1: Duplicate all template slides
  for (let i = 0; i < payloads.length; i++) {
    const payload = payloads[i];
    const templateInfo = templateMap.get(payload.slide_template);
    if (!templateInfo) {
      throw new Error(
        `No template slide info found for template key: ${payload.slide_template}`
      );
    }

    const { slideObjectId, imageSlots } = templateInfo;
    const dupSlideId = `dup_${i}_${slideObjectId}`;

    const objectIds: Record<string, string> = {
      [slideObjectId]: dupSlideId,
    };

    for (const [, origElemId] of imageSlots) {
      objectIds[origElemId] = `dup_${i}_${origElemId}`;
    }

    requests.push({
      duplicateObject: {
        objectId: slideObjectId,
        objectIds,
      },
    });
  }

  // Phase 2: Replace text on each duplicated slide
  for (let i = 0; i < payloads.length; i++) {
    const payload = payloads[i];
    const templateInfo = templateMap.get(payload.slide_template);
    if (!templateInfo) continue;

    const { slideObjectId } = templateInfo;
    const dupSlideId = `dup_${i}_${slideObjectId}`;
    const templateDef = getTemplate(payload.slide_template);

    for (const field of templateDef.fields) {
      if (field.type === 'text' && field.name in payload) {
        requests.push({
          replaceAllText: {
            containsText: {
              text: `{{${field.name.toUpperCase()}}}`,
              matchCase: true,
            },
            replaceText: payload[field.name],
            pageObjectIds: [dupSlideId],
          },
        });
      }
    }
  }

  // Phase 3: Replace images on each duplicated slide
  for (let i = 0; i < payloads.length; i++) {
    const payload = payloads[i];
    const templateInfo = templateMap.get(payload.slide_template);
    if (!templateInfo) continue;

    const { imageSlots } = templateInfo;
    const templateDef = getTemplate(payload.slide_template);

    for (const field of templateDef.fields) {
      if (field.type === 'image' && field.name in payload) {
        const origElemId = imageSlots.get(field.name);
        if (!origElemId) continue;

        const dupElemId = `dup_${i}_${origElemId}`;

        requests.push({
          replaceImage: {
            imageObjectId: dupElemId,
            url: payload[field.name],
            imageReplaceMethod: 'CENTER_CROP',
          },
        });
      }
    }
  }

  // Phase 4: Reorder duplicated slides to front in payload order.
  // Move one slide at a time, from the end of the desired sequence to the
  // front, so we do not need to know the intermediate presentation order after
  // repeated duplicate operations.
  const dupSlideIds: string[] = [];
  for (let i = 0; i < payloads.length; i++) {
    const payload = payloads[i];
    const templateInfo = templateMap.get(payload.slide_template);
    if (!templateInfo) continue;
    dupSlideIds.push(`dup_${i}_${templateInfo.slideObjectId}`);
  }

  for (let i = dupSlideIds.length - 1; i >= 0; i--) {
    requests.push({
      updateSlidesPosition: {
        slideObjectIds: [dupSlideIds[i]],
        insertionIndex: 0,
      },
    });
  }

  // Phase 5: Delete original template slides
  const uniqueOriginalSlideIds = new Set<string>();
  for (const [, templateInfo] of templateMap) {
    uniqueOriginalSlideIds.add(templateInfo.slideObjectId);
  }

  for (const origSlideId of uniqueOriginalSlideIds) {
    requests.push({
      deleteObject: {
        objectId: origSlideId,
      },
    });
  }

  return requests;
}
