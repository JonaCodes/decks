import { observer } from 'mobx-react-lite'
import { Stack, Text, NumberInput, Group, Button } from '@mantine/core'
import { useStore } from '../../../../stores/StoreContext'
import type { SlideElement } from '../../../../types/presentation'

interface Props {
  element: SlideElement
}

const ZIndexWidget = observer(({ element }: Props) => {
  const store = useStore()
  const slideId = element.slideId as number

  const setZIndex = (zIndex: number) => {
    store.editor.updateElement(slideId, element.id, { zIndex })
  }

  return (
    <Stack gap={8}>
      <Text size="xs" fw={600} c="dimmed">Layer Order</Text>
      <NumberInput
        label="Z-Index"
        size="xs"
        value={element.zIndex}
        onChange={(val) => { if (typeof val === 'number') setZIndex(val) }}
      />
      <Group gap={6}>
        <Button size="xs" variant="default" onClick={() => setZIndex(element.zIndex + 1)}>
          Bring Forward
        </Button>
        <Button size="xs" variant="default" onClick={() => setZIndex(element.zIndex - 1)}>
          Send Backward
        </Button>
      </Group>
    </Stack>
  )
})

export default ZIndexWidget
