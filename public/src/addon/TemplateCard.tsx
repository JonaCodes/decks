import { useEffect, useState } from 'react';
import { Card, Group, Image, Stack, Text } from '@mantine/core';
import type { TemplateDefinition } from '@shared/templates/types.js';
import classes from './addon.module.css';

interface TemplateCardProps {
  template: TemplateDefinition;
  onClick: () => void;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const [hideThumbnail, setHideThumbnail] = useState(false);
  const showThumbnail = Boolean(template.thumbnailUrl) && !hideThumbnail;

  useEffect(() => {
    setHideThumbnail(false);
  }, [template.thumbnailUrl]);

  return (
    <Card
      padding='xs'
      radius='sm'
      withBorder
      onClick={onClick}
      className={classes.card}
    >
      {showThumbnail && (
        <Card.Section px='xs' pt='xs'>
          <Image
            src={template.thumbnailUrl}
            alt={`${template.name} thumbnail`}
            fit='fill'
            radius={'sm'}
            h={128}
            onError={() => {
              console.warn(
                'Thumbnail image failed to render',
                template.templateKey
              );
              setHideThumbnail(true);
            }}
          />
        </Card.Section>
      )}
      <Stack gap={4} pt='4'>
        <Group justify='space-between' align='flex-start' wrap='nowrap'>
          <Text fw={600} size='sm' lineClamp={1} style={{ flex: 1 }}>
            {template.name}
          </Text>
        </Group>
        <Text size='xs' c='dimmed' lineClamp={3}>
          {template.description}
        </Text>
      </Stack>
    </Card>
  );
}
