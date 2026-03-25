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

  async function handleBatchEdit() {
    const results = await sendGetSelectedSlidesMetadata();
    if (results.length === 0) return;
    setBatchSlides(results);
    onViewChange('batch-editing');
  }

  function handleBatchFieldChange(fieldName: string, newValue: string) {
    for (const slide of batchSlides) {
      if (
        fieldName in slide.fields &&
        slide.fields[fieldName].type === 'text'
      ) {
        sendUpdateSlideFieldText(
          slide.slideObjectId,
          fieldName,
          newValue
        ).catch(console.error);
      }
    }
    setBatchSlides((prev) =>
      prev.map((s) => {
        if (!(fieldName in s.fields) || s.fields[fieldName].type !== 'text')
          return s;
        return {
          ...s,
          fields: {
            ...s.fields,
            [fieldName]: { type: 'text', value: newValue },
          },
        };
      })
    );
  }

  function handleBatchDone() {
    setBatchSlides([]);
    onViewChange('browse');
  }

  return {
    batchSlides,
    handleBatchEdit,
    handleBatchFieldChange,
    handleBatchDone,
  };
}
