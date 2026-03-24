import { useState } from 'react';
import { Button, Divider, Group, Stack, Text, TextInput } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import type {
  ImageSuggestion,
  TemplateDefinition,
} from '@shared/templates/types.js';
import ImageField from './ImageField.js';
import TemplateThumbnail from './TemplateThumbnail.js';

interface TemplateFormProps {
  template: TemplateDefinition;
  onCancel: () => void;
  onSuccess: (values: Record<string, string>) => void;
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

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (onAccept) {
      onAccept(values);
      return;
    }

    onSuccess(values);
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
      </Stack>

      <Button radius={0} type='submit' size='md' color='#FFBA00' c='black'>
        {submitLabel}
      </Button>
    </form>
  );
}
