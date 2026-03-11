import { observer } from 'mobx-react-lite'
import { Stack, Text, Select } from '@mantine/core'
import type { SlideElement } from '../../../../types/presentation'

const SHADOW_PRESETS: Record<string, string> = {
  None: '',
  Soft: '0 2px 8px rgba(0,0,0,0.12)',
  Medium: '0 4px 16px rgba(0,0,0,0.24)',
  Hard: '0 8px 24px rgba(0,0,0,0.4)',
}

const SHADOW_LABELS = Object.keys(SHADOW_PRESETS)

function shadowToLabel(shadow: string): string {
  return SHADOW_LABELS.find((label) => SHADOW_PRESETS[label] === shadow) ?? 'None'
}

interface Props {
  element: SlideElement
  onChange: (changes: Record<string, unknown>) => void
}

const ShadowWidget = observer(({ element, onChange }: Props) => {
  const props = element.properties as { shadow?: string }
  const currentLabel = shadowToLabel(props.shadow ?? '')

  return (
    <Stack gap={6}>
      <Text size="xs" fw={600} c="dimmed">Shadow</Text>
      <Select
        size="xs"
        data={SHADOW_LABELS}
        value={currentLabel}
        onChange={(label) => label && onChange({ shadow: SHADOW_PRESETS[label] })}
      />
    </Stack>
  )
})

export default ShadowWidget
