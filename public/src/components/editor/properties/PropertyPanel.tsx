import { observer } from 'mobx-react-lite'
import { Stack, Text, Divider } from '@mantine/core'
import { useStore } from '../../../stores/StoreContext'
import type { SlideElement } from '../../../types/presentation'
import BackgroundColorWidget from './widgets/BackgroundColorWidget'
import ColorPickerWidget from './widgets/ColorPickerWidget'
import TextFormattingWidget from './widgets/TextFormattingWidget'
import BorderWidget from './widgets/BorderWidget'
import ShadowWidget from './widgets/ShadowWidget'
import ImageWidget from './widgets/ImageWidget'
import PositionWidget from './widgets/PositionWidget'
import RevealOrderWidget from './widgets/RevealOrderWidget'
import ZIndexWidget from './widgets/ZIndexWidget'

type WidgetType =
  | 'textFormatting'
  | 'colorPicker'
  | 'backgroundColor'
  | 'border'
  | 'shadow'
  | 'image'
  | 'position'
  | 'revealOrder'
  | 'zIndex'

const ELEMENT_WIDGETS: Record<SlideElement['type'], WidgetType[]> = {
  text: ['textFormatting', 'colorPicker', 'position', 'revealOrder', 'zIndex'],
  split_color_text: ['textFormatting', 'position', 'revealOrder', 'zIndex'],
  shape: ['backgroundColor', 'border', 'shadow', 'position', 'revealOrder', 'zIndex'],
  image: ['image', 'border', 'shadow', 'position', 'revealOrder', 'zIndex'],
  placeholder_image: ['image', 'border', 'shadow', 'position', 'revealOrder', 'zIndex'],
}

interface ElementWidgetsProps {
  element: SlideElement
}

const ElementWidgets = observer(({ element }: ElementWidgetsProps) => {
  const store = useStore()
  const slideId = element.slideId
  const widgets = ELEMENT_WIDGETS[element.type]

  if (slideId === null) {
    return <div style={{ padding: 16 }}>Template element selected</div>
  }

  const onChange = (changes: Record<string, unknown>) => {
    store.editor.updateElement(slideId, element.id, {
      properties: { ...element.properties, ...changes },
    })
  }

  return (
    <Stack gap={16} p={16}>
      {widgets.map((widget, i) => (
        <div key={widget}>
          {i > 0 && <Divider mb={8} />}
          {widget === 'textFormatting' && (
            <TextFormattingWidget element={element} onChange={onChange} />
          )}
          {widget === 'colorPicker' && (
            <ColorPickerWidget element={element} onChange={onChange} />
          )}
          {widget === 'backgroundColor' && (
            <ColorPickerWidget
              element={element}
              onChange={onChange}
              propertyKey="backgroundColor"
              label="Fill Color"
            />
          )}
          {widget === 'border' && (
            <BorderWidget element={element} onChange={onChange} />
          )}
          {widget === 'shadow' && (
            <ShadowWidget element={element} onChange={onChange} />
          )}
          {widget === 'image' && (
            <ImageWidget element={element} onChange={onChange} />
          )}
          {widget === 'position' && <PositionWidget element={element} />}
          {widget === 'revealOrder' && <RevealOrderWidget element={element} />}
          {widget === 'zIndex' && <ZIndexWidget element={element} />}
        </div>
      ))}
    </Stack>
  )
})

export const PropertyPanel = observer(() => {
  const store = useStore()
  const { selectedElementIds, currentSlide } = store.editor

  if (!currentSlide) return null

  if (selectedElementIds.length === 0) {
    return (
      <Stack gap={0} p={16}>
        <BackgroundColorWidget />
      </Stack>
    )
  }

  if (selectedElementIds.length > 1) {
    return (
      <Stack p={16}>
        <Text size="sm" c="dimmed">Multiple elements selected</Text>
      </Stack>
    )
  }

  const element = currentSlide.elements.find((el) => el.id === selectedElementIds[0])
  if (!element) return null

  return <ElementWidgets element={element} />
})
