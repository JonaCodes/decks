import type {
  InsertSlideResponse,
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
  values: Record<string, string>
): Promise<InsertSlideResponse> {
  const id = generateId();
  return new Promise<InsertSlideResponse>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    window.parent.postMessage(
      { type: 'insertSlide', id, payload: { templateKey, values } },
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
