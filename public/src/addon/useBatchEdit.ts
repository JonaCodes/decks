import { useState } from 'react';
import type { SlideMetadata } from '@shared/templates/types.js';
import {
  sendGetSelectedSlidesMetadata,
  sendUpdateSlideFieldText,
} from './bridge.js';

export function useBatchEdit(
  onViewChange: (view: 'batch-editing' | 'browse') => void
) {
  const [batchSlides, setBatchSlides] = useState<SlideMetadata[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  async function handleBatchEdit() {
    setBatchLoading(true);
    try {
      const results = await sendGetSelectedSlidesMetadata();
      if (results.length === 0) return;
      setBatchSlides(results);
      onViewChange('batch-editing');
    } finally {
      setBatchLoading(false);
    }
  }

  async function handleBatchUpdate(
    changes: Record<string, string>
  ): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const slide of batchSlides) {
      for (const [fieldName, newValue] of Object.entries(changes)) {
        if (
          fieldName in slide.fields &&
          slide.fields[fieldName].type === 'text'
        ) {
          promises.push(
            sendUpdateSlideFieldText(slide.slideObjectId, fieldName, newValue)
          );
        }
      }
    }
    await Promise.all(promises);
    setBatchSlides((prev) =>
      prev.map((s) => {
        const updatedFields = { ...s.fields };
        for (const [fieldName, newValue] of Object.entries(changes)) {
          if (
            fieldName in updatedFields &&
            updatedFields[fieldName].type === 'text'
          ) {
            updatedFields[fieldName] = { type: 'text', value: newValue };
          }
        }
        return { ...s, fields: updatedFields };
      })
    );
  }

  function handleBatchDone() {
    setBatchSlides([]);
    onViewChange('browse');
  }

  return {
    batchSlides,
    batchLoading,
    handleBatchEdit,
    handleBatchUpdate,
    handleBatchDone,
  };
}
