import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import type { TemplateDefinition } from '@shared/templates/types.js';

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
      style={{ cursor: 'pointer' }}
    >
      <Stack gap={4}>
        <Group justify='space-between' align='flex-start' wrap='nowrap'>
          <Text fw={600} size='sm' lineClamp={1} style={{ flex: 1 }}>
            {template.name}
          </Text>
          <Badge
            size='xs'
            variant='light'
            color='blue'
            style={{ flexShrink: 0 }}
          >
            {template.fields.length}{' '}
            {template.fields.length === 1 ? 'field' : 'fields'}
          </Badge>
        </Group>
        <Text size='xs' c='dimmed' lineClamp={2}>
          {template.description}
        </Text>
      </Stack>
    </Card>
  );
}
