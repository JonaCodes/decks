import { useEffect, useRef, useState } from 'react';
import type {
  ImageSuggestion,
  PlannedSlide,
  SlideRecord,
  TemplateDefinition,
} from '@shared/templates/types.js';
import {
  sendFinalizeSlide,
  sendGetCurrentSlide,
  sendInsertSlide,
  sendUpdateSlideImage,
  sendUpdateSlideText,
} from './bridge.js';

interface InsertItem {
  templateKey: string;
  label: string;
  values: Record<string, string>;
  imageSuggestions: Record<string, ImageSuggestion>;
}

export function useInsertPhase(
  templates: TemplateDefinition[],
  isEditing: boolean,
  onViewChange: (view: 'inserting' | 'editing' | 'browse') => void
) {
  const [insertProgress, setInsertProgress] = useState(0);
  const [insertTotal, setInsertTotal] = useState(0);
  const [insertError, setInsertError] = useState<string | null>(null);
  const insertCancelledRef = useRef(false);

  const [insertedSlides, setInsertedSlides] = useState<SlideRecord[]>([]);
  const [currentSlideId, setCurrentSlideId] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isEditing) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }
    pollIntervalRef.current = setInterval(() => {
      sendGetCurrentSlide()
        .then((res) => setCurrentSlideId(res.slideObjectId))
        .catch(() => {});
    }, 1500);
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isEditing]);

  function handlePlanReady(slides: PlannedSlide[]) {
    const items: InsertItem[] = [];
    for (const slide of slides) {
      const tpl = templates.find((t) => t.templateKey === slide.template_key);
      if (!tpl) {
        console.warn(`Template key not found, skipping: ${slide.template_key}`);
        continue;
      }
      items.push({
        templateKey: slide.template_key,
        label: tpl.name,
        values: slide.fields,
        imageSuggestions: slide.image_suggestions ?? {},
      });
    }
    if (items.length === 0) return;
    setInsertProgress(0);
    setInsertTotal(items.length);
    setInsertError(null);
    insertCancelledRef.current = false;
    setInsertedSlides([]);
    onViewChange('inserting');
    runInserts(items);
  }

  async function runInserts(items: InsertItem[]) {
    const records: SlideRecord[] = [];
    for (let i = 0; i < items.length; i++) {
      if (insertCancelledRef.current) break;
      const item = items[i];
      try {
        const result = await sendInsertSlide(
          item.templateKey,
          item.values,
          true
        );
        records.push({
          slideObjectId: result.slideObjectId,
          templateKey: item.templateKey,
          values: { ...item.values },
          imageSuggestions: item.imageSuggestions,
          insertionIndex: i,
        });
      } catch (err) {
        setInsertError(
          `Failed on "${item.label}": ${err instanceof Error ? err.message : String(err)}`
        );
        return;
      }
      setInsertProgress(i + 1);
    }
    if (!insertCancelledRef.current) {
      setInsertedSlides(records);
      onViewChange('editing');
    }
  }

  function handleCancelInsert() {
    insertCancelledRef.current = true;
    setInsertedSlides([]);
    onViewChange('browse');
  }

  async function handleUpdate(changes: Record<string, string>): Promise<void> {
    const record = insertedSlides.find(
      (r) => r.slideObjectId === currentSlideId
    );
    if (!record) return;

    const template = templates.find(
      (t) => t.templateKey === record.templateKey
    );
    const promises: Promise<void>[] = [];

    for (const [fieldName, newValue] of Object.entries(changes)) {
      const field = template?.fields.find((f) => f.name === fieldName);
      if (field?.type === 'image') {
        promises.push(
          sendUpdateSlideImage(record.slideObjectId, fieldName, newValue)
        );
        for (const r of insertedSlides) {
          if (
            r.insertionIndex > record.insertionIndex &&
            r.imageSuggestions[fieldName]?.reuse_previous_visual
          ) {
            promises.push(
              sendUpdateSlideImage(r.slideObjectId, fieldName, newValue)
            );
          }
        }
      } else {
        const oldValue = record.values[fieldName] ?? '';
        promises.push(
          sendUpdateSlideText(
            record.slideObjectId,
            fieldName,
            oldValue,
            newValue
          )
        );
      }
    }

    await Promise.all(promises);

    setInsertedSlides((prev) =>
      prev.map((r) => {
        if (r.slideObjectId === record.slideObjectId) {
          return { ...r, values: { ...r.values, ...changes } };
        }
        const reusedUpdates: Record<string, string> = {};
        for (const [fieldName, newValue] of Object.entries(changes)) {
          const field = template?.fields.find((f) => f.name === fieldName);
          if (
            field?.type === 'image' &&
            r.insertionIndex > record.insertionIndex &&
            r.imageSuggestions[fieldName]?.reuse_previous_visual
          ) {
            reusedUpdates[fieldName] = newValue;
          }
        }
        if (Object.keys(reusedUpdates).length > 0) {
          return { ...r, values: { ...r.values, ...reusedUpdates } };
        }
        return r;
      })
    );
  }

  async function handleDoneEditing() {
    for (const record of insertedSlides) {
      const tpl = templates.find((t) => t.templateKey === record.templateKey);
      if (!tpl) continue;
      const unfilledTextFields = tpl.fields
        .filter((f) => f.type === 'text' && !record.values[f.name])
        .map((f) => f.name);
      const unfilledImageFields = tpl.fields
        .filter((f) => f.type === 'image' && !record.values[f.name])
        .map((f) => f.name);
      if (unfilledTextFields.length > 0 || unfilledImageFields.length > 0) {
        try {
          await sendFinalizeSlide(
            record.slideObjectId,
            unfilledTextFields,
            unfilledImageFields
          );
        } catch (err) {
          console.error('Failed to finalize slide:', err);
        }
      }
    }
    setInsertedSlides([]);
    onViewChange('browse');
  }

  const editingRecord =
    insertedSlides.find((r) => r.slideObjectId === currentSlideId) ?? null;
  const editingTemplate = editingRecord
    ? (templates.find((t) => t.templateKey === editingRecord.templateKey) ??
      null)
    : null;

  return {
    insertProgress,
    insertTotal,
    insertError,
    editingRecord,
    editingTemplate,
    handlePlanReady,
    handleCancelInsert,
    handleUpdate,
    handleDoneEditing,
  };
}
