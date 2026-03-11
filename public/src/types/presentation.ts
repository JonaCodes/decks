export interface SlideElement {
  id: number;
  slideId: number | null;
  templateId: number | null;
  type: 'text' | 'split_color_text' | 'shape' | 'image' | 'placeholder_image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  revealOrder: number | null;
  properties: Record<string, unknown>;
  zIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Slide {
  id: number;
  presentationId: number;
  templateId: number | null;
  order: number;
  backgroundColor: string;
  elements: SlideElement[];
  createdAt: string;
  updatedAt: string;
}

export interface PresentationPlaceholder {
  id: number;
  presentationId: number;
  placeholderKey: string;
  imageSrc: string;
  createdAt: string;
  updatedAt: string;
}

export interface Presentation {
  id: number;
  name: string;
  userId: number;
  slides: Slide[];
  placeholders: PresentationPlaceholder[];
  createdAt: string;
  updatedAt: string;
}

export interface SlideTemplate {
  id: number;
  name: string;
  description: string | null;
  metadata: Record<string, unknown>;
  userId: number;
  elements: SlideElement[];
  createdAt: string;
  updatedAt: string;
}

export interface BulkSavePayload {
  slides: Array<
    Omit<Slide, 'id' | 'elements'> & {
      id?: number;
      elements: Array<Omit<SlideElement, 'id'> & { id?: number }>;
    }
  >;
  placeholders: Array<Omit<PresentationPlaceholder, 'id'> & { id?: number }>;
}
