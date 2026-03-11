import { observer } from 'mobx-react-lite'
import { Stack, Text, ColorInput } from '@mantine/core'
import { useStore } from '../../../../stores/StoreContext'

const BackgroundColorWidget = observer(() => {
  const store = useStore()
  const slide = store.editor.currentSlide

  if (!slide) return null

  return (
    <Stack gap={6}>
      <Text size="xs" fw={600} c="dimmed">Slide Background</Text>
      <ColorInput
        size="xs"
        value={slide.backgroundColor}
        onChange={(color) => store.editor.updateSlideBackground(slide.id, color)}
      />
    </Stack>
  )
})

export default BackgroundColorWidget
