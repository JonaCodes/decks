import {
  Box,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import type { SlideMetadata } from '@shared/templates/types.js';

interface BatchEditViewProps {
  slides: SlideMetadata[];
  onFieldChange: (fieldName: string, newValue: string) => void;
  onDone: () => void;
}

export function BatchEditView({
  slides,
  onFieldChange,
  onDone,
}: BatchEditViewProps) {
  const allFieldNames = Array.from(
    new Set(
      slides.flatMap((s) =>
        Object.entries(s.fields)
          .filter(([, f]) => f.type === 'text')
          .map(([name]) => name)
      )
    )
  ).sort();

  function getTextValues(fieldName: string): string[] {
    return slides
      .filter(
        (s) => fieldName in s.fields && s.fields[fieldName].type === 'text'
      )
      .map((s) => s.fields[fieldName].value);
  }

  function getDisplayValue(fieldName: string): string {
    const values = getTextValues(fieldName);
    if (values.length === 0) return '';
    return values.every((v) => v === values[0]) ? values[0] : '';
  }

  function isMixed(fieldName: string): boolean {
    const values = getTextValues(fieldName);
    return values.length > 1 && !values.every((v) => v === values[0]);
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
        <Button size='xs' variant='subtle' onClick={onDone}>
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
              defaultValue={getDisplayValue(fieldName)}
              onBlur={(e) => {
                const newValue = e.currentTarget.value;
                onFieldChange(fieldName, newValue);
              }}
              size='xs'
            />
          ))
        )}
      </Stack>
    </Box>
  );
}
