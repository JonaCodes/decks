import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconCheck } from '@tabler/icons-react';
import type { TemplateDefinition } from '@shared/templates/types.js';
import { sendInsertSlide } from './bridge.js';

interface TemplateFormProps {
  template: TemplateDefinition;
  onCancel: () => void;
  onSuccess: () => void;
}

export function TemplateForm({
  template,
  onCancel,
  onSuccess,
}: TemplateFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(template.fields.map((f) => [f.name, '']))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      <Stack gap='sm' style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {/* Header */}
        <Stack gap={4}>
          <Text fw={600} size='sm'>
            {template.name}
          </Text>
          <Text size='xs' c='dimmed'>
            {template.description}
          </Text>
          <Group gap='xs'>
            <Badge size='xs' variant='light' color='blue'>
              {template.fields.length}{' '}
              {template.fields.length === 1 ? 'field' : 'fields'}
            </Badge>
          </Group>
        </Stack>

        <Divider />

        {/* Fields */}
        {template.fields.length === 0 ? (
          <Text size='xs' c='dimmed'>
            This template has no fields.
          </Text>
        ) : (
          template.fields.map((field) => (
            <TextInput
              key={field.name}
              label={field.name}
              placeholder={
                field.type === 'image' ? 'Image URL' : `Enter ${field.name}`
              }
              required={field.required}
              value={values[field.name] ?? ''}
              onChange={(e) => handleChange(field.name, e.currentTarget.value)}
              size='xs'
            />
          ))
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

      {/* Actions */}
      <Divider />
      <Group gap='xs' p='xs' justify='flex-end'>
        <Button
          variant='subtle'
          size='xs'
          leftSection={<IconArrowLeft size={14} />}
          onClick={onCancel}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type='submit'
          size='xs'
          disabled={loading || success}
          leftSection={loading ? <Loader size={12} color='white' /> : undefined}
        >
          {loading ? 'Inserting…' : 'Insert Slide'}
        </Button>
      </Group>
    </form>
  );
}
