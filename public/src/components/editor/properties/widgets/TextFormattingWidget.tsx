import { observer } from 'mobx-react-lite'
import { Stack, Text, Select, NumberInput, SegmentedControl, ColorInput } from '@mantine/core'
import type { SlideElement } from '../../../../types/presentation'

const FONT_FAMILIES = ['Figtree', 'Arial', 'Georgia', 'Courier New', 'Impact']
const FONT_WEIGHTS = ['normal', 'bold', '300', '600', '800']
const TEXT_ALIGNS = ['left', 'center', 'right']

interface Props {
  element: SlideElement
  onChange: (changes: Record<string, unknown>) => void
}

const TextFormattingWidget = observer(({ element, onChange }: Props) => {
  const props = element.properties as {
    fontFamily?: string
    fontSize?: number
    fontWeight?: string
    textAlign?: string
    color1?: string
    color2?: string
  }
  const isSplitColor = element.type === 'split_color_text'

  return (
    <Stack gap={8}>
      <Text size="xs" fw={600} c="dimmed">Text Formatting</Text>
      <Select
        label="Font Family"
        size="xs"
        data={FONT_FAMILIES}
        value={props.fontFamily}
        onChange={(val) => val && onChange({ fontFamily: val })}
      />
      <NumberInput
        label="Font Size"
        size="xs"
        min={8}
        max={200}
        value={props.fontSize}
        onChange={(val) => onChange({ fontSize: val })}
      />
      <Select
        label="Font Weight"
        size="xs"
        data={FONT_WEIGHTS}
        value={props.fontWeight}
        onChange={(val) => val && onChange({ fontWeight: val })}
      />
      <Stack gap={4}>
        <Text size="xs" c="dimmed">Text Align</Text>
        <SegmentedControl
          size="xs"
          data={TEXT_ALIGNS}
          value={props.textAlign}
          onChange={(val) => onChange({ textAlign: val })}
        />
      </Stack>
      {isSplitColor && (
        <>
          <ColorInput
            label="Color 1"
            size="xs"
            value={props.color1}
            onChange={(color) => onChange({ color1: color })}
          />
          <ColorInput
            label="Color 2"
            size="xs"
            value={props.color2}
            onChange={(color) => onChange({ color2: color })}
          />
        </>
      )}
    </Stack>
  )
})

export default TextFormattingWidget
