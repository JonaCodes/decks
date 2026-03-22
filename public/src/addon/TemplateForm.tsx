import { useState } from 'react';
import {
  Alert,
  Button,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import type {
  ImageSuggestion,
  TemplateDefinition,
} from '@shared/templates/types.js';
import { sendInsertSlide } from './bridge.js';
import ImageField from './ImageField.js';
import TemplateThumbnail from './TemplateThumbnail.js';

interface TemplateFormProps {
  template: TemplateDefinition;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: Record<string, string>;
  imageSuggestions?: Record<string, ImageSuggestion>;
  submitLabel?: string;
  /** When provided, submit calls onAccept(values) instead of inserting via the bridge. */
  onAccept?: (values: Record<string, string>) => void;
}

export function TemplateForm({
  template,
  onCancel,
  onSuccess,
  initialValues,
  imageSuggestions,
  submitLabel = 'Insert slide',
  onAccept,
}: TemplateFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      template.fields.map((f) => [f.name, initialValues?.[f.name] ?? ''])
    )
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (onAccept) {
      onAccept(values);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await sendInsertSlide(template.templateKey, values);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to insert slide.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Group justify='space-between' px='xs' py='xs'>
        <Text size='sm'>{template.name}</Text>
        <Button
          justify='end'
          variant='subtle'
          size='xs'
          onClick={onCancel}
          disabled={loading}
          color='#FFBA00'
        >
          <IconX size={14} />
        </Button>
      </Group>
      <Divider />
      <Stack gap='sm' style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        <TemplateThumbnail template={template} />

        {/* Fields */}
        {template.fields.length === 0 ? (
          <Text size='xs' c='dimmed'>
            This template has no fields.
          </Text>
        ) : (
          template.fields
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((field) =>
              field.type === 'image' ? (
                <ImageField
                  key={field.name}
                  field={field}
                  value={values[field.name] ?? ''}
                  onChange={(value) => handleChange(field.name, value)}
                  hint={(() => {
                    const s = imageSuggestions?.[field.name];
                    if (!s) return undefined;
                    return s.reuse_previous_visual
                      ? `Reuse previous visual — ${s.description}`
                      : s.description;
                  })()}
                />
              ) : (
                <TextInput
                  autoFocus={field.name === template.fields[0].name}
                  key={field.name}
                  label={field.name}
                  placeholder={`Enter ${field.name}`}
                  required={field.required}
                  value={values[field.name] ?? ''}
                  onChange={(e) =>
                    handleChange(field.name, e.currentTarget.value)
                  }
                  size='xs'
                />
              )
            )
        )}

        {/* Feedback */}
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

        {success && (
          <Alert
            icon={<IconCheck size={14} />}
            color='green'
            variant='light'
            p='xs'
          >
            <Text size='xs'>Slide inserted successfully!</Text>
          </Alert>
        )}
      </Stack>

      <Button
        radius={0}
        type='submit'
        size='md'
        disabled={!onAccept && (loading || success)}
        color='#FFBA00'
        c='black'
        leftSection={loading ? <Loader size={12} color='white' /> : undefined}
      >
        {loading ? 'Inserting…' : submitLabel}
      </Button>
    </form>
  );
}
