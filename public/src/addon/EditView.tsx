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
import type {
  ImageSuggestion,
  SlideRecord,
  TemplateDefinition,
} from '@shared/templates/types.js';
import ImageField from './ImageField.js';
import { useDirtyForm } from './useDirtyForm.js';

interface EditViewProps {
  slideRecord: SlideRecord | null;
  template: TemplateDefinition | null;
  onUpdate: (changes: Record<string, string>) => Promise<void>;
  onDone: () => void;
}

export function EditView({
  slideRecord,
  template,
  onUpdate,
  onDone,
}: EditViewProps) {
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const initialValues = Object.fromEntries(
    (template?.fields ?? []).map((f) => [
      f.name,
      slideRecord?.values[f.name] ?? '',
    ])
  );
  const resetKey = slideRecord?.slideObjectId ?? '';
  const { formValues, setField, dirtyFields, isDirty, resetDirty } =
    useDirtyForm(initialValues, resetKey);

  if (!slideRecord || !template) {
    return (
      <Box
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text size='xs' c='dimmed' ta='center'>
          Navigate to an inserted slide to edit it
        </Text>
      </Box>
    );
  }

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
      key={slideRecord.slideObjectId}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Group justify='space-between' px='xs' py='xs' style={{ flexShrink: 0 }}>
        <Text size='sm'>{template.name}</Text>
        <Button size='xs' variant='subtle' onClick={onDone} disabled={updating}>
          Done
        </Button>
      </Group>
      <Divider />
      <Stack gap='sm' style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {template.fields.length === 0 ? (
          <Text size='xs' c='dimmed'>
            This template has no fields.
          </Text>
        ) : (
          template.fields
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((field) => {
              const suggestion: ImageSuggestion | undefined =
                slideRecord.imageSuggestions[field.name];
              if (field.type === 'image') {
                return (
                  <ImageField
                    key={field.name}
                    field={field}
                    value={formValues[field.name] ?? ''}
                    onChange={(value) => setField(field.name, value)}
                    hint={
                      suggestion
                        ? suggestion.reuse_previous_visual
                          ? `Reuse previous visual — ${suggestion.description}`
                          : suggestion.description
                        : undefined
                    }
                  />
                );
              }
              return (
                <TextInput
                  key={field.name}
                  label={field.name}
                  placeholder={`Enter ${field.name}`}
                  required={field.required}
                  value={formValues[field.name] ?? ''}
                  onChange={(e) => setField(field.name, e.currentTarget.value)}
                  size='xs'
                />
              );
            })
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
