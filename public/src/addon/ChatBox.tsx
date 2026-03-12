import { useState } from 'react';
import {
  ActionIcon,
  Alert,
  Box,
  Paper,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { IconAlertCircle, IconSend } from '@tabler/icons-react';
import redaxios from 'redaxios';

const API_BASE = (import.meta.env.VITE_BACKEND_URL ?? '') + '/api';

interface PlanResponse {
  message?: string;
  plan?: string;
  [key: string]: unknown;
}

export function ChatBox() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const text = prompt.trim();
    if (!text || loading) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await redaxios.post<PlanResponse>(`${API_BASE}/plan-slides`, {
        prompt: text,
      });
      const data = res.data;
      const msg =
        typeof data.message === 'string'
          ? data.message
          : typeof data.plan === 'string'
            ? data.plan
            : JSON.stringify(data, null, 2);
      setResponse(msg);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setLoading(false);
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
        {response && (
          <Paper p='xs' radius='sm' withBorder>
            <Text
              size='xs'
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {response}
            </Text>
          </Paper>
        )}

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
            placeholder='Describe the slides you need…'
            value={prompt}
            onChange={(e) => setPrompt(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            autosize
            minRows={1}
            maxRows={4}
            size='xs'
            style={{ flex: 1 }}
            disabled={loading}
          />
          <ActionIcon
            onClick={handleSend}
            loading={loading}
            disabled={!prompt.trim()}
            variant='filled'
            size='md'
            aria-label='Send'
            mb={1}
          >
            <IconSend size={14} />
          </ActionIcon>
        </Box>
      </Stack>
    </Box>
  );
}
