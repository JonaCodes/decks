import { useEffect, useState } from 'react';
import {
  Box,
  Center,
  Loader,
  ScrollArea,
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
          <Center py='xl'>
            <Stack align='center' gap='xs'>
              <Loader size='sm' />
              <Text size='xs' c='dimmed'>
                Loading templates…
              </Text>
            </Stack>
          </Center>
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
