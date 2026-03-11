import { observer } from 'mobx-react-lite'
import { Stack, Text, ColorInput, NumberInput } from '@mantine/core'
import type { SlideElement } from '../../../../types/presentation'

interface Props {
  element: SlideElement
  onChange: (changes: Record<string, unknown>) => void
}

const BorderWidget = observer(({ element, onChange }: Props) => {
  const props = element.properties as {
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
  }

  return (
    <Stack gap={8}>
      <Text size="xs" fw={600} c="dimmed">Border</Text>
      <ColorInput
        label="Border Color"
        size="xs"
        value={props.borderColor}
        onChange={(color) => onChange({ borderColor: color })}
      />
      <NumberInput
        label="Border Width (px)"
        size="xs"
        min={0}
        value={props.borderWidth}
        onChange={(val) => onChange({ borderWidth: val })}
      />
      <NumberInput
        label="Border Radius (px)"
        size="xs"
        min={0}
        value={props.borderRadius}
        onChange={(val) => onChange({ borderRadius: val })}
      />
    </Stack>
  )
})

export default BorderWidget
