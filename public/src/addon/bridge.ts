import type {
  InsertSlideResponse,
  SlideMetadata,
  TemplateDefinition,
} from '@shared/templates/types.js';

type PendingResolver = {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

const pending = new Map<string, PendingResolver>();

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'discoverTemplatesResult') {
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if (data.error) {
      p.reject(new Error(data.error));
    } else {
      p.resolve(data.result);
    }
  }

  if (data.type === 'uploadImageResult') {
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if (data.error) {
      p.reject(new Error(data.error));
    } else {
      p.resolve(data.result);
    }
  }

  if (data.type === 'insertSlideResult') {
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if (data.error) {
      p.reject(new Error(data.error));
    } else {
      p.resolve(data.result);
    }
  }

  if (data.type === 'getCurrentSlideResult') {
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if (data.error) p.reject(new Error(data.error));
    else p.resolve(data.result);
  }

  if (data.type === 'updateSlideImageResult') {
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if (data.error) p.reject(new Error(data.error));
    else p.resolve(data.result);
  }

  if (data.type === 'updateSlideTextResult') {
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if (data.error) p.reject(new Error(data.error));
    else p.resolve(data.result);
  }

  if (data.type === 'finalizeSlideResult') {
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if (data.error) p.reject(new Error(data.error));
    else p.resolve(data.result);
  }

  if (data.type === 'updateSlideFieldTextResult') {
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if (data.error) p.reject(new Error(data.error));
    else p.resolve(data.result);
  }

  if (data.type === 'getSelectedSlidesMetadataResult') {
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if (data.error) p.reject(new Error(data.error));
    else p.resolve(data.result);
  }

  if (data.type === 'testBridgeResult') {
    const p = pending.get('testBridge');
    if (!p) return;
    pending.delete('testBridge');
    if (data.error) {
      p.reject(new Error(data.error));
    } else {
      p.resolve(data.result);
    }
  }
});

export function sendInsertSlide(
  templateKey: string,
  values: Record<string, string>,
  appendToEnd?: boolean
): Promise<InsertSlideResponse> {
  const id = generateId();
  return new Promise<InsertSlideResponse>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    window.parent.postMessage(
      {
        type: 'insertSlide',
        id,
        payload: { templateKey, values, appendToEnd: appendToEnd ?? false },
      },
      '*'
    );
  });
}

export function sendDiscoverTemplates(): Promise<TemplateDefinition[]> {
  const id = generateId();
  return new Promise<TemplateDefinition[]>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    window.parent.postMessage({ type: 'discoverTemplates', id }, '*');
  });
}

export function sendUploadImage(
  base64Data: string,
  mimeType: string
): Promise<{ url: string }> {
  const id = generateId();
  return new Promise<{ url: string }>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    window.parent.postMessage(
      { type: 'uploadImage', id, payload: { base64Data, mimeType } },
      '*'
    );
  });
}

export function sendTestBridge(): Promise<{ ok: boolean }> {
  return new Promise<{ ok: boolean }>((resolve, reject) => {
    pending.set('testBridge', {
      resolve: resolve as (v: unknown) => void,
      reject,
    });
    window.parent.postMessage({ type: 'testBridge' }, '*');
  });
}

export function sendGetCurrentSlide(): Promise<{
  slideObjectId: string | null;
}> {
  const id = generateId();
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    window.parent.postMessage({ type: 'getCurrentSlide', id }, '*');
  });
}

export function sendUpdateSlideImage(
  slideObjectId: string,
  fieldName: string,
  imageUrl: string
): Promise<void> {
  const id = generateId();
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    window.parent.postMessage(
      {
        type: 'updateSlideImage',
        id,
        payload: { slideObjectId, fieldName, imageUrl },
      },
      '*'
    );
  });
}

export function sendFinalizeSlide(
  slideObjectId: string,
  unfilledTextFields: string[],
  unfilledImageFields: string[]
): Promise<void> {
  const id = generateId();
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    window.parent.postMessage(
      {
        type: 'finalizeSlide',
        id,
        payload: { slideObjectId, unfilledTextFields, unfilledImageFields },
      },
      '*'
    );
  });
}

export function sendUpdateSlideText(
  slideObjectId: string,
  fieldName: string,
  oldValue: string,
  newValue: string
): Promise<void> {
  const id = generateId();
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    window.parent.postMessage(
      {
        type: 'updateSlideText',
        id,
        payload: { slideObjectId, fieldName, oldValue, newValue },
      },
      '*'
    );
  });
}

export function sendUpdateSlideFieldText(
  slideObjectId: string,
  fieldName: string,
  newValue: string
): Promise<void> {
  const id = generateId();
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    window.parent.postMessage(
      {
        type: 'updateSlideFieldText',
        id,
        payload: { slideObjectId, fieldName, newValue },
      },
      '*'
    );
  });
}

export function sendGetSelectedSlidesMetadata(): Promise<SlideMetadata[]> {
  const id = generateId();
  return new Promise<SlideMetadata[]>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    window.parent.postMessage({ type: 'getSelectedSlidesMetadata', id }, '*');
  });
}
