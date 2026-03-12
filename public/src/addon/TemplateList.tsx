import { Stack, Text } from '@mantine/core';
import type { TemplateDefinition } from '@shared/templates/types.js';
import { TemplateCard } from './TemplateCard.js';

interface TemplateListProps {
  templates: TemplateDefinition[];
  search: string;
  onSelect: (t: TemplateDefinition) => void;
}

export function TemplateList({
  templates,
  search,
  onSelect,
}: TemplateListProps) {
  const query = search.toLowerCase().trim();

  const filtered = query
    ? templates.filter(
        (t) =>
          t.templateKey.toLowerCase().includes(query) ||
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      )
    : templates;

  if (filtered.length === 0) {
    return (
      <Text size='sm' c='dimmed' ta='center' py='md'>
        {query ? 'No templates match your search.' : 'No templates available.'}
      </Text>
    );
  }

  return (
    <Stack gap='xs'>
      {filtered.map((template) => (
        <TemplateCard
          key={template.templateKey}
          template={template}
          onClick={() => onSelect(template)}
        />
      ))}
    </Stack>
  );
}
