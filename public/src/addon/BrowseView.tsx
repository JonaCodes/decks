import {
  ActionIcon,
  Box,
  Card,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconRefresh, IconSearch } from '@tabler/icons-react';
import type { PlannedSlide, TemplateDefinition } from '@shared/templates/types.js';
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
  onSearchChange: (value: string) => void;
  onSyncTemplates: () => void;
  onSelectTemplate: (t: TemplateDefinition) => void;
  onPlanReady: (slides: PlannedSlide[]) => void;
}

export function BrowseView({
  templates,
  search,
  loadingTemplates,
  fetchError,
  syncing,
  onSearchChange,
  onSyncTemplates,
  onSelectTemplate,
  onPlanReady,
}: BrowseViewProps) {
  return (
    <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
