import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { SlideMetadata } from '@shared/templates/types.js';
import { useDirtyForm } from './useDirtyForm.js';

interface BatchEditViewProps {
  slides: SlideMetadata[];
  onUpdate: (changes: Record<string, string>) => Promise<void>;
  onDone: () => void;
}

export function BatchEditView({
  slides,
  onUpdate,
  onDone,
}: BatchEditViewProps) {
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const allFieldNames = Array.from(
    new Set(
      slides.flatMap((s) =>
        Object.entries(s.fields)
          .filter(([, f]) => f.type === 'text')
          .map(([name]) => name)
      )
    )
  ).sort();

  function getDisplayValue(fieldName: string): string {
    const values = slides
      .filter(
        (s) => fieldName in s.fields && s.fields[fieldName].type === 'text'
      )
      .map((s) => s.fields[fieldName].value);
    if (values.length === 0) return '';
    return values.every((v) => v === values[0]) ? values[0] : '';
  }

  function isMixed(fieldName: string): boolean {
    const values = slides
      .filter(
        (s) => fieldName in s.fields && s.fields[fieldName].type === 'text'
      )
      .map((s) => s.fields[fieldName].value);
    return values.length > 1 && !values.every((v) => v === values[0]);
  }

  const resetKey = slides.map((s) => s.slideObjectId).join(',');
  const initialValues = Object.fromEntries(
    allFieldNames.map((name) => [name, getDisplayValue(name)])
  );
  const { formValues, setField, dirtyFields, isDirty, resetDirty } =
    useDirtyForm(initialValues, resetKey);

  async function handleUpdate() {
    setUpdating(true);
    setUpdateError(null);
    try {
      await onUpdate(dirtyFields);
      resetDirty();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdating(false);
    }
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
      <Group justify='space-between' px='xs' py='xs' style={{ flexShrink: 0 }}>
        <Text size='sm'>
          Editing {slides.length} slide{slides.length !== 1 ? 's' : ''}
        </Text>
        <Button size='xs' variant='subtle' onClick={onDone} disabled={updating}>
          Done
        </Button>
      </Group>
      <Divider />
      <Stack gap='sm' style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {allFieldNames.length === 0 ? (
          <Text size='xs' c='dimmed' ta='center'>
            No editable fields found in selected slides.
          </Text>
        ) : (
          allFieldNames.map((fieldName) => (
            <TextInput
              key={fieldName}
              label={fieldName}
              placeholder={
                isMixed(fieldName) ? '(mixed)' : `Enter ${fieldName}`
              }
              value={formValues[fieldName] ?? ''}
              onChange={(e) => setField(fieldName, e.currentTarget.value)}
              size='xs'
            />
          ))
        )}
      </Stack>
      <Box p='xs' style={{ flexShrink: 0 }}>
        {updateError && (
          <Alert
            icon={<IconAlertCircle size={14} />}
            color='red'
            variant='light'
            p='xs'
            mb='xs'
            withCloseButton
            onClose={() => setUpdateError(null)}
          >
            <Text size='xs'>{updateError}</Text>
          </Alert>
        )}
        <Button
          fullWidth
          disabled={!isDirty || updating}
          loading={updating}
          onClick={handleUpdate}
        >
          Update
        </Button>
      </Box>
    </Box>
  );
}
