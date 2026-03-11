import { observer } from 'mobx-react-lite'
import { Stack, Text, NumberInput, SimpleGrid } from '@mantine/core'
import { useStore } from '../../../../stores/StoreContext'
import type { SlideElement } from '../../../../types/presentation'

interface Props {
  element: SlideElement
}

const PositionWidget = observer(({ element }: Props) => {
  const store = useStore()
  const slideId = element.slideId as number

  const update = (changes: Partial<Pick<SlideElement, 'x' | 'y' | 'width' | 'height' | 'rotation'>>) => {
    store.editor.updateElement(slideId, element.id, changes)
  }

  return (
    <Stack gap={8}>
      <Text size="xs" fw={600} c="dimmed">Position & Size</Text>
      <SimpleGrid cols={2} spacing={6}>
        <NumberInput
          label="X"
          size="xs"
          value={element.x}
          onChange={(val) => { if (typeof val === 'number') update({ x: val }) }}
        />
        <NumberInput
          label="Y"
          size="xs"
          value={element.y}
          onChange={(val) => { if (typeof val === 'number') update({ y: val }) }}
        />
        <NumberInput
          label="Width"
          size="xs"
          min={1}
          value={element.width}
          onChange={(val) => { if (typeof val === 'number') update({ width: val }) }}
        />
        <NumberInput
          label="Height"
          size="xs"
          min={1}
          value={element.height}
          onChange={(val) => { if (typeof val === 'number') update({ height: val }) }}
        />
      </SimpleGrid>
      <NumberInput
        label="Rotation (°)"
        size="xs"
        value={element.rotation}
        onChange={(val) => { if (typeof val === 'number') update({ rotation: val }) }}
      />
    </Stack>
  )
})

export default PositionWidget
