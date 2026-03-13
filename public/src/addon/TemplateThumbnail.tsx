import { Image } from '@mantine/core';
import type { TemplateDefinition } from '@shared/templates/types.js';
import { useState } from 'react';

interface TemplateThumbnailProps {
  template: TemplateDefinition;
}

export default function TemplateThumbnail({
  template,
}: TemplateThumbnailProps) {
  const [hideThumbnail, setHideThumbnail] = useState(false);
  const showThumbnail = Boolean(template.thumbnailUrl) && !hideThumbnail;

  if (!showThumbnail) return null;

  return (
    <Image
      src={template.thumbnailUrl}
      alt={`${template.name} thumbnail`}
      fit='fill'
      radius={'sm'}
      h={128}
      onError={(error) => {
        console.error(
          'Thumbnail image failed to render',
          template.templateKey,
          error
        );
        setHideThumbnail(true);
      }}
    />
  );
}
