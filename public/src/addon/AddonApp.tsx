import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { TemplateDefinition } from '@shared/templates/types.js';
import { sendDiscoverTemplates } from './bridge.js';
import { TemplateList } from './TemplateList.js';
import { TemplateForm } from './TemplateForm.js';
import { ChatBox } from './ChatBox.js';

type View = 'browse' | 'form';

function LoadingTemplateSkeletons() {
  return (
    <Stack gap='xs' py='xs'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} padding='xs' radius='sm' withBorder>
          <Stack gap={6}>
            <Skeleton height={128} radius={0} />
            <Skeleton height={14} width='70%' />
            <Skeleton height={12} width='40%' />
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

export function AddonApp() {
  const [view, setView] = useState<View>('browse');
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateDefinition | null>(null);
  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);
  const [search, setSearch] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

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

  function handleSuccess() {
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
          onSuccess={handleSuccess}
        />
      </Box>
    );
  }

  return (
    <Box
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Search */}
      <Box p='xs' style={{ flexShrink: 0 }}>
        <TextInput
          placeholder='Search templates…'
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          size='xs'
        />
      </Box>

      {/* Template list — scrollable middle section */}
      <ScrollArea style={{ flex: 1 }} px='xs'>
        {loadingTemplates ? (
          <LoadingTemplateSkeletons />
        ) : fetchError ? (
          <Text size='xs' c='red' ta='center' py='md'>
            {fetchError}
          </Text>
        ) : (
          <Box pb='xs'>
            <TemplateList
              templates={templates}
              search={search}
              onSelect={handleSelectTemplate}
            />
          </Box>
        )}
      </ScrollArea>

      {/* Chat box — pinned bottom */}
      <ChatBox />
    </Box>
  );
}
