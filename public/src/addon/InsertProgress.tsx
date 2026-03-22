import {
  Box,
  Button,
  Group,
  Loader,
  Progress,
  Stack,
  Text,
} from '@mantine/core';

interface InsertProgressProps {
  progress: number;
  total: number;
  error: string | null;
  onCancel: () => void;
}

export function InsertProgress({
  progress,
  total,
  error,
  onCancel,
}: InsertProgressProps) {
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;
  return (
    <Box
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Stack p='md' gap='md' style={{ flex: 1, justifyContent: 'center' }}>
        <Text size='sm' fw={500} ta='center'>
          Inserting slides…
        </Text>
        <Progress value={pct} size='sm' />
        <Text size='xs' c='dimmed' ta='center'>
          {progress} / {total}
        </Text>
        {error && (
          <Stack gap='xs'>
            <Text size='xs' c='red' ta='center'>
              {error}
            </Text>
            <Button size='xs' variant='subtle' onClick={onCancel}>
              Close
            </Button>
          </Stack>
        )}
        {!error && (
          <Group justify='center'>
            <Loader size='xs' />
          </Group>
        )}
      </Stack>
    </Box>
  );
}
