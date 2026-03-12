import type {
  FieldType,
  TemplateField,
  TemplateDefinition,
} from '@shared/templates/types.js';

export type { FieldType, TemplateField, TemplateDefinition };

export type SlidePayload = Record<string, string> & { slide_template: string };

export const MANIFEST: TemplateDefinition[] = [
  {
    templateKey: 'A',
    name: 'Image with caption',
    description: 'Single image with caption',
    fields: [
      { name: 'text', type: 'text', required: true },
      { name: 'img_url', type: 'image', required: true },
    ],
  },
  {
    templateKey: 'B',
    name: 'Three text points',
    description: 'Three text points',
    fields: [
      { name: 'text1', type: 'text', required: true },
      { name: 'text2', type: 'text', required: true },
      { name: 'text3', type: 'text', required: false },
    ],
  },
];

export function getTemplate(key: string): TemplateDefinition {
  const template = MANIFEST.find((t) => t.templateKey === key);
  if (!template) {
    throw new Error(`Unknown template: "${key}"`);
  }
  return template;
}

export function validateSlidePayload(payload: SlidePayload): void {
  const template = getTemplate(payload.slide_template);

  for (const field of template.fields) {
    if (field.required && !(field.name in payload)) {
      throw new Error(
        `Missing required field "${field.name}" for template "${template.templateKey}"`
      );
    }
  }
}
