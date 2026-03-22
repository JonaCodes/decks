import { useRef, useState } from 'react';
import { Box, Image, Loader, Stack, Text, TextInput } from '@mantine/core';
import type { TemplateField } from '@shared/templates/types.js';
import { sendUploadImage } from './bridge.js';

interface ImageFieldProps {
  field: TemplateField;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}

export default function ImageField({
  field,
  onChange,
  value,
  hint,
}: ImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handlePaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith('image/'));
    if (!imageItem) return;

    e.preventDefault();
    setError(null);

    const file = imageItem.getAsFile();
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large (max 5MB)');
      return;
    }

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const result = await sendUploadImage(base64, file.type);
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Stack gap={4}>
      <Box onPaste={handlePaste} style={{ position: 'relative' }}>
        <TextInput
          ref={inputRef}
          label={field.name}
          placeholder='Paste image or enter URL'
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          size='xs'
          disabled={uploading}
          rightSection={uploading ? <Loader size={12} /> : undefined}
        />
      </Box>
      {hint && !value && (
        <Text size='xs' c='dimmed' fs='italic'>
          {hint}
        </Text>
      )}
      {error && (
        <Text size='xs' c='red'>
          {error}
        </Text>
      )}
      {value && !uploading && (
        <Image
          src={value}
          alt='Preview'
          radius='sm'
          h={80}
          fit='contain'
          onError={() => {
            /* silently ignore preview errors */
          }}
        />
      )}
    </Stack>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:image/png;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
