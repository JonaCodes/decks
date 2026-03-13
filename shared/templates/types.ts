export type FieldType = 'text' | 'image';

export interface TemplateField {
  name: string;
  type: FieldType;
  required: boolean;
}

export interface TemplateDefinition {
  templateKey: string;
  name: string;
  description: string;
  fields: TemplateField[];
  thumbnailUrl?: string;
}

export interface InsertSlideRequest {
  templateKey: string;
  values: Record<string, string>;
}

export interface InsertSlideResponse {
  slideObjectId: string;
}
