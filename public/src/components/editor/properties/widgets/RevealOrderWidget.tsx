import { observer } from 'mobx-react-lite'
import { Stack, Text, Checkbox, NumberInput } from '@mantine/core'
import { useStore } from '../../../../stores/StoreContext'
import type { SlideElement } from '../../../../types/presentation'

interface Props {
  element: SlideElement
}

const RevealOrderWidget = observer(({ element }: Props) => {
  const store = useStore()
  const slideId = element.slideId as number
  const alwaysVisible = element.revealOrder === null

  const handleAlwaysVisibleChange = (checked: boolean) => {
    store.editor.updateElement(slideId, element.id, {
      revealOrder: checked ? null : 1,
    })
  }

  const handleOrderChange = (val: string | number) => {
    if (typeof val === 'number') {
      store.editor.updateElement(slideId, element.id, { revealOrder: val })
    }
  }

  return (
    <Stack gap={8}>
      <Text size="xs" fw={600} c="dimmed">Reveal</Text>
      <Checkbox
        label="Always visible"
        size="xs"
        checked={alwaysVisible}
        onChange={(e) => handleAlwaysVisibleChange(e.currentTarget.checked)}
      />
      {!alwaysVisible && (
        <NumberInput
          label="Reveal Order"
          size="xs"
          min={1}
          value={element.revealOrder ?? 1}
          onChange={handleOrderChange}
        />
      )}
    </Stack>
  )
})

export default RevealOrderWidget
