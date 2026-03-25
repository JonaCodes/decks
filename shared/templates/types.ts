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

export interface ImageSuggestion {
  description: string;
  reuse_previous_visual: boolean;
}

export interface PlannedTemplateSlide {
  type: 'template';
  template_key: string;
  fields: Record<string, string>;
  image_suggestions?: Record<string, ImageSuggestion>;
}

export type PlannedSlide = PlannedTemplateSlide;

export interface InsertSlideResponse {
  slideObjectId: string;
}

export interface SlideFieldValue {
  type: FieldType;
  value: string;
}

export interface SlideMetadata {
  slideObjectId: string;
  templateKey: string;
  fields: Record<string, SlideFieldValue>;
}

export interface SlideRecord {
  slideObjectId: string;
  templateKey: string;
  values: Record<string, string>;
  imageSuggestions: Record<string, ImageSuggestion>;
  insertionIndex: number;
}
