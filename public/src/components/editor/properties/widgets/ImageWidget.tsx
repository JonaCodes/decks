import { observer } from 'mobx-react-lite'
import { Stack, Text, TextInput, Select } from '@mantine/core'
import type { SlideElement } from '../../../../types/presentation'

const OBJECT_FIT_OPTIONS = ['cover', 'contain', 'fill', 'none']

interface Props {
  element: SlideElement
  onChange: (changes: Record<string, unknown>) => void
}

const ImageWidget = observer(({ element, onChange }: Props) => {
  const props = element.properties as {
    src?: string
    placeholderKey?: string
    objectFit?: string
  }

  return (
    <Stack gap={8}>
      <Text size="xs" fw={600} c="dimmed">Image</Text>
      {element.type === 'image' && (
        <TextInput
          label="Image URL"
          size="xs"
          value={props.src}
          onChange={(e) => onChange({ src: e.currentTarget.value })}
        />
      )}
      {element.type === 'placeholder_image' && (
        <TextInput
          label="Placeholder Key"
          size="xs"
          value={props.placeholderKey}
          onChange={(e) => onChange({ placeholderKey: e.currentTarget.value })}
        />
      )}
      <Select
        label="Object Fit"
        size="xs"
        data={OBJECT_FIT_OPTIONS}
        value={props.objectFit}
        onChange={(val) => val && onChange({ objectFit: val })}
      />
    </Stack>
  )
})

export default ImageWidget
