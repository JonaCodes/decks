import {
  Box,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import type {
  ImageSuggestion,
  SlideRecord,
  TemplateDefinition,
} from '@shared/templates/types.js';
import ImageField from './ImageField.js';

interface EditViewProps {
  slideRecord: SlideRecord | null;
  template: TemplateDefinition | null;
  onFieldChange: (fieldName: string, newValue: string) => void;
  onDone: () => void;
}

export function EditView({
  slideRecord,
  template,
  onFieldChange,
  onDone,
}: EditViewProps) {
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
        <Button size='xs' variant='subtle' onClick={onDone}>
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
              const currentValue = slideRecord.values[field.name] ?? '';
              const suggestion: ImageSuggestion | undefined =
                slideRecord.imageSuggestions[field.name];
              if (field.type === 'image') {
                return (
                  <ImageField
                    key={field.name}
                    field={field}
                    value={currentValue}
                    onChange={(value) => onFieldChange(field.name, value)}
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
                  defaultValue={currentValue}
                  onBlur={(e) => {
                    const newValue = e.currentTarget.value;
                    if (newValue !== currentValue) {
                      onFieldChange(field.name, newValue);
                    }
                  }}
                  size='xs'
                />
              );
            })
        )}
      </Stack>
    </Box>
  );
}
