import {
  ActionIcon,
  Alert,
  Box,
  Card,
  Group,
  Loader,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconPencil,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import type {
  PlannedSlide,
  TemplateDefinition,
} from '@shared/templates/types.js';
import { TemplateList } from './TemplateList.js';
import { ChatBox } from './ChatBox.js';

function LoadingTemplateSkeletons() {
  return (
    <Stack gap='xs' py='xs'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} padding='xs' radius='sm' withBorder>
          <Stack gap={6}>
            <Skeleton height={14} width='40%' radius={'sm'} />
            <Skeleton height={128} radius={'sm'} />
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

interface BrowseViewProps {
  templates: TemplateDefinition[];
  search: string;
  loadingTemplates: boolean;
  fetchError: string | null;
  syncing: boolean;
  pendingInserts: number;
  insertErrors: string[];
  onSearchChange: (value: string) => void;
  onSyncTemplates: () => void;
  onSelectTemplate: (t: TemplateDefinition) => void;
  onPlanReady: (slides: PlannedSlide[]) => void;
  onClearInsertErrors: () => void;
  onBatchEdit: () => void;
  batchLoading: boolean;
}

export function BrowseView({
  templates,
  search,
  loadingTemplates,
  fetchError,
  syncing,
  pendingInserts,
  insertErrors,
  onSearchChange,
  onSyncTemplates,
  onSelectTemplate,
  onPlanReady,
  onClearInsertErrors,
  onBatchEdit,
  batchLoading,
}: BrowseViewProps) {
  return (
    <Box
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Search + Sync */}
      <Box p='xs' style={{ flexShrink: 0, display: 'flex', gap: 6 }}>
        <TextInput
          placeholder='Search templates…'
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          size='xs'
          style={{ flex: 1 }}
        />
        <Tooltip label='Batch edit selected slides' position='bottom'>
          <ActionIcon
            onClick={onBatchEdit}
            loading={batchLoading}
            variant='subtle'
            size='md'
            aria-label='Batch edit'
            mt={1}
          >
            <IconPencil size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label='Sync templates to prompt file' position='bottom'>
          <ActionIcon
            onClick={onSyncTemplates}
            loading={syncing}
            variant='subtle'
            size='md'
            aria-label='Sync templates'
            mt={1}
          >
            <IconRefresh size={14} />
          </ActionIcon>
        </Tooltip>
      </Box>

      {/* Background insert status */}
      {(pendingInserts > 0 || insertErrors.length > 0) && (
        <Box px='xs' pb='xs'>
          {pendingInserts > 0 && (
            <Group gap='xs'>
              <Loader size='xs' color='#FFBA00' />
              <Text size='xs' c='dimmed'>
                Inserting {pendingInserts} slide{pendingInserts > 1 ? 's' : ''}…
              </Text>
            </Group>
          )}
          {insertErrors.length > 0 && (
            <Alert
              icon={<IconAlertCircle size={14} />}
              color='red'
              variant='light'
              p='xs'
              withCloseButton
              onClose={onClearInsertErrors}
            >
              <Text size='xs'>{insertErrors.join('; ')}</Text>
            </Alert>
          )}
        </Box>
      )}

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
              onSelect={onSelectTemplate}
            />
          </Box>
        )}
      </ScrollArea>

      {/* Chat box — pinned bottom */}
      <ChatBox onPlanReady={onPlanReady} />
    </Box>
  );
}
