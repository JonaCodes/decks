import { useEffect, useState } from 'react';
import {
  useBackgroundInserts,
  TITLE_FIELD_NAME,
} from './useBackgroundInserts.js';
import { useInsertPhase } from './useInsertPhase.js';
import { useBatchEdit } from './useBatchEdit.js';
import { Box } from '@mantine/core';
import redaxios from 'redaxios';
import type { TemplateDefinition } from '@shared/templates/types.js';
import { sendDiscoverTemplates } from './bridge.js';
import { TemplateForm } from './TemplateForm.js';
import { BrowseView } from './BrowseView.js';
import { InsertProgress } from './InsertProgress.js';
import { EditView } from './EditView.js';
import { BatchEditView } from './BatchEditView.js';

const API_BASE = (import.meta.env.VITE_BACKEND_URL ?? '') + '/api';

type View = 'browse' | 'form' | 'inserting' | 'editing' | 'batch-editing';

export function AddonApp() {
  const [view, setView] = useState<View>('browse');
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateDefinition | null>(null);
  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);
  const [search, setSearch] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [retainedTitle, setRetainedTitle] = useState('');
  const {
    pending: pendingInserts,
    errors: insertErrors,
    insert: backgroundInsert,
    clearErrors: clearInsertErrors,
  } = useBackgroundInserts();

  const {
    insertProgress,
    insertTotal,
    insertError,
    editingRecord,
    editingTemplate,
    handlePlanReady,
    handleCancelInsert,
    handleFieldChange,
    handleDoneEditing,
  } = useInsertPhase(templates, view === 'editing', setView);

  const {
    batchSlides,
    handleBatchEdit,
    handleBatchFieldChange,
    handleBatchDone,
  } = useBatchEdit(setView);

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

  function handleSelectTemplate(t: TemplateDefinition) {
    setSelectedTemplate(t);
    setView('form');
  }

  function handleCancel() {
    setView('browse');
    setSelectedTemplate(null);
  }

  function handleManualInsert(values: Record<string, string>) {
    setRetainedTitle(values[TITLE_FIELD_NAME] ?? '');
    backgroundInsert(selectedTemplate!.templateKey, values);
    setView('browse');
    setSelectedTemplate(null);
  }

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
          onSuccess={handleManualInsert}
          initialValues={{ [TITLE_FIELD_NAME]: retainedTitle }}
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

  if (view === 'batch-editing') {
    return (
      <BatchEditView
        slides={batchSlides}
        onFieldChange={handleBatchFieldChange}
        onDone={handleBatchDone}
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
      pendingInserts={pendingInserts}
      insertErrors={insertErrors}
      onClearInsertErrors={clearInsertErrors}
      onBatchEdit={handleBatchEdit}
    />
  );
}
