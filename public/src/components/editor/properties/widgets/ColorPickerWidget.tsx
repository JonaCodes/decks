import { observer } from 'mobx-react-lite'
import { ColorInput, Stack, Text } from '@mantine/core'
import type { SlideElement } from '../../../../types/presentation'

interface Props {
  element: SlideElement
  onChange: (changes: Record<string, unknown>) => void
  /** Which property key to bind to. Defaults to 'color'. */
  propertyKey?: string
  label?: string
}

const ColorPickerWidget = observer(({ element, onChange, propertyKey = 'color', label = 'Text Color' }: Props) => {
  const props = element.properties as Record<string, string>

  return (
    <Stack gap={6}>
      <Text size="xs" fw={600} c="dimmed">{label}</Text>
      <ColorInput
        value={props[propertyKey]}
        onChange={(color) => onChange({ [propertyKey]: color })}
        size="xs"
      />
    </Stack>
  )
})

export default ColorPickerWidget
