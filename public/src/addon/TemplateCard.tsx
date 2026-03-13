import { Card, Text } from '@mantine/core';
import type { TemplateDefinition } from '@shared/templates/types.js';
import classes from './addon.module.css';
import TemplateThumbnail from './TemplateThumbnail';

interface TemplateCardProps {
  template: TemplateDefinition;
  onClick: () => void;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <Card
      padding='xs'
      radius='sm'
      withBorder
      onClick={onClick}
      className={classes.card}
    >
      <Text size='xs' lineClamp={1}>
        {template.name}
      </Text>

      <Card.Section px='xs' pb='xs' pt={4}>
        <TemplateThumbnail template={template} />
      </Card.Section>
    </Card>
  );
}
