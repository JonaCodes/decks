import { useState } from 'react';
import { ActionIcon, Alert, Box, Stack, Text, Textarea } from '@mantine/core';
import { IconAlertCircle, IconSend } from '@tabler/icons-react';
import type { PlannedSlide } from '@shared/templates/types.js';

interface ChatBoxProps {
  onPlanReady: (slides: PlannedSlide[]) => void;
}

function parsePlan(text: string): PlannedSlide[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON — could not parse the pasted plan.');
  }
  if (!Array.isArray(parsed)) {
    throw new Error('Expected a JSON array of slides.');
  }
  if (parsed.length === 0) {
    throw new Error('Plan contains no slides.');
  }
  for (const item of parsed) {
    if (!item || typeof item !== 'object' || !('type' in item)) {
      throw new Error('Each slide must have a "type" field.');
    }
    if (item.type !== 'template' && item.type !== 'custom') {
      throw new Error(
        `Unknown slide type: "${item.type}". Expected "template" or "custom".`
      );
    }
  }
  return parsed as PlannedSlide[];
}

export function ChatBox({ onPlanReady }: ChatBoxProps) {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSend() {
    const text = prompt.trim();
    if (!text) return;

    setError(null);
    try {
      const slides = parsePlan(text);
      onPlanReady(slides);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse plan.');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <Box p='xs' style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
      <Stack gap='xs'>
        {error && (
          <Alert
            icon={<IconAlertCircle size={14} />}
            color='red'
            variant='light'
            p='xs'
          >
            <Text size='xs'>{error}</Text>
          </Alert>
        )}

        <Box style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <Textarea
            placeholder='Paste slide plan JSON…'
            value={prompt}
            onChange={(e) => setPrompt(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            autosize
            minRows={1}
            maxRows={4}
            size='xs'
            style={{ flex: 1 }}
          />
          <ActionIcon
            onClick={handleSend}
            disabled={!prompt.trim()}
            variant='filled'
            size='md'
            aria-label='Load plan'
            mb={1}
          >
            <IconSend size={14} />
          </ActionIcon>
        </Box>
      </Stack>
    </Box>
  );
}
