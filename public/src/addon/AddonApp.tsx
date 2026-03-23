import { useEffect, useRef, useState } from 'react';
import { Box } from '@mantine/core';
import redaxios from 'redaxios';
import type {
  ImageSuggestion,
  PlannedSlide,
  SlideRecord,
  TemplateDefinition,
} from '@shared/templates/types.js';
import {
  sendDiscoverTemplates,
  sendFinalizeSlide,
  sendGetCurrentSlide,
  sendInsertSlide,
  sendUpdateSlideImage,
  sendUpdateSlideText,
  sendUploadImage,
} from './bridge.js';
import { TemplateForm } from './TemplateForm.js';
import { BrowseView } from './BrowseView.js';
import { InsertProgress } from './InsertProgress.js';
import { EditView } from './EditView.js';

const API_BASE = (import.meta.env.VITE_BACKEND_URL ?? '') + '/api';

type View = 'browse' | 'form' | 'inserting' | 'editing';

export function AddonApp() {
  const [view, setView] = useState<View>('browse');
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateDefinition | null>(null);
  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);
  const [search, setSearch] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Insert phase state
  const [insertProgress, setInsertProgress] = useState(0);
  const [insertTotal, setInsertTotal] = useState(0);
  const [insertError, setInsertError] = useState<string | null>(null);
  const insertCancelledRef = useRef(false);

  // Edit phase state
  const [insertedSlides, setInsertedSlides] = useState<SlideRecord[]>([]);
  const [currentSlideId, setCurrentSlideId] = useState<string | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function handleSyncTemplates() {
    if (syncing) return;
    setSyncing(true);
    try {
      const data = await sendDiscoverTemplates();
      const stripped = data.map(({ thumbnailUrl: _, ...rest }) => rest);
      const res = await redaxios.post(`${API_BASE}/sync-templates`, {
        templates: stripped,
      });
      if (res.data.prompt) {
        console.log(res.data.prompt);
        navigator.clipboard.writeText(res.data.prompt);
      }
    } catch {
      // Sync is a dev convenience — silent fail is fine
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoadingTemplates(true);
    setFetchError(null);

    sendDiscoverTemplates()
      .then((data) => {
        if (!cancelled) setTemplates(data);
      })
      .catch((err) => {
        if (!cancelled)
          setFetchError(
            err instanceof Error ? err.message : 'Failed to load templates.'
          );
      })
      .finally(() => {
        if (!cancelled) setLoadingTemplates(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (view !== 'editing') {
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
  }, [view]);

  function handleSelectTemplate(t: TemplateDefinition) {
    setSelectedTemplate(t);
    setView('form');
  }

  function handleCancel() {
    setView('browse');
    setSelectedTemplate(null);
  }

  function handleSuccess() {
    setView('browse');
    setSelectedTemplate(null);
  }

  function handlePlanReady(slides: PlannedSlide[]) {
    const items: Array<{
      templateKey: string;
      label: string;
      values: Record<string, string>;
      imageSuggestions: Record<string, ImageSuggestion>;
      customHtml?: string;
      customCss?: string;
    }> = [];
    for (const slide of slides) {
      if (slide.type === 'custom') {
        const tpl = templates.find((t) => t.templateKey === 'custom');
        if (!tpl) {
          console.warn('Custom template not found, skipping custom slide');
          continue;
        }
        items.push({
          templateKey: 'custom',
          label: tpl.name,
          values: { title: slide.title },
          imageSuggestions: {},
          customHtml: slide.html,
          customCss: slide.css,
        });
        continue;
      }
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
    setView('inserting');
    runInserts(items);
  }

  async function runInserts(
    items: Array<{
      templateKey: string;
      label: string;
      values: Record<string, string>;
      imageSuggestions: Record<string, ImageSuggestion>;
      customHtml?: string;
      customCss?: string;
    }>
  ) {
    const records: SlideRecord[] = [];
    for (let i = 0; i < items.length; i++) {
      if (insertCancelledRef.current) break;
      const item = items[i];
      try {
        if (item.customHtml) {
          const renderRes = await redaxios.post(
            `${API_BASE}/render-custom-slide`,
            { html: item.customHtml, css: item.customCss ?? '' }
          );
          const { base64Data, mimeType } = renderRes.data as {
            base64Data: string;
            mimeType: string;
          };
          const uploadResult = await sendUploadImage(base64Data, mimeType);
          item.values.visual = uploadResult.url;
        }
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
      setView('editing');
    }
  }

  function handleCancelInsert() {
    insertCancelledRef.current = true;
    setInsertedSlides([]);
    setView('browse');
  }

  function handleFieldChange(fieldName: string, newValue: string) {
    const record = insertedSlides.find(
      (r) => r.slideObjectId === currentSlideId
    );
    if (!record) return;

    const oldValue = record.values[fieldName] ?? '';
    const template = templates.find(
      (t) => t.templateKey === record.templateKey
    );
    const field = template?.fields.find((f) => f.name === fieldName);

    if (field?.type === 'image') {
      sendUpdateSlideImage(record.slideObjectId, fieldName, newValue).catch(
        console.error
      );
      // Propagate to later slides with reuse_previous_visual
      insertedSlides
        .filter(
          (r) =>
            r.insertionIndex > record.insertionIndex &&
            r.imageSuggestions[fieldName]?.reuse_previous_visual
        )
        .forEach((r) => {
          sendUpdateSlideImage(r.slideObjectId, fieldName, newValue).catch(
            console.error
          );
        });
      // Update state for current and propagated slides
      setInsertedSlides((prev) =>
        prev.map((r) => {
          if (
            r.slideObjectId === record.slideObjectId ||
            (r.insertionIndex > record.insertionIndex &&
              r.imageSuggestions[fieldName]?.reuse_previous_visual)
          ) {
            return { ...r, values: { ...r.values, [fieldName]: newValue } };
          }
          return r;
        })
      );
    } else {
      sendUpdateSlideText(
        record.slideObjectId,
        fieldName,
        oldValue,
        newValue
      ).catch(console.error);
      setInsertedSlides((prev) =>
        prev.map((r) =>
          r.slideObjectId === record.slideObjectId
            ? { ...r, values: { ...r.values, [fieldName]: newValue } }
            : r
        )
      );
    }
  }

  async function handleDoneEditing() {
    // Clean up unfilled placeholders on all inserted slides
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
    setView('browse');
  }

  const editingRecord =
    insertedSlides.find((r) => r.slideObjectId === currentSlideId) ?? null;
  const editingTemplate = editingRecord
    ? (templates.find((t) => t.templateKey === editingRecord.templateKey) ??
      null)
    : null;

  if (view === 'form' && selectedTemplate) {
    return (
      <Box
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <TemplateForm
          template={selectedTemplate}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      </Box>
    );
  }

  if (view === 'inserting') {
    return (
      <InsertProgress
        progress={insertProgress}
        total={insertTotal}
        error={insertError}
        onCancel={handleCancelInsert}
      />
    );
  }

  if (view === 'editing') {
    return (
      <EditView
        slideRecord={editingRecord}
        template={editingTemplate}
        onFieldChange={handleFieldChange}
        onDone={handleDoneEditing}
      />
    );
  }

  return (
    <BrowseView
      templates={templates}
      search={search}
      loadingTemplates={loadingTemplates}
      fetchError={fetchError}
      syncing={syncing}
      onSearchChange={setSearch}
      onSyncTemplates={handleSyncTemplates}
      onSelectTemplate={handleSelectTemplate}
      onPlanReady={handlePlanReady}
    />
  );
}
