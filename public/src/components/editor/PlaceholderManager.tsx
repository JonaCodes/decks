import { observer } from 'mobx-react-lite'
import { useState, useEffect } from 'react'
import { Modal, Button, Stack, TextInput, Text, Group } from '@mantine/core'
import { useStore } from '../../stores/StoreContext'

interface PlaceholderManagerProps {
  open: boolean
  onClose: () => void
}

const PlaceholderManager = observer(({ open, onClose }: PlaceholderManagerProps) => {
  const store = useStore()
  const { presentation } = store.editor

  const allKeys = presentation
    ? [
        ...new Set(
          presentation.slides.flatMap((slide) =>
            slide.elements
              .filter((el) => el.type === 'placeholder_image')
              .map((el) => el.properties.placeholderKey as string)
              .filter(Boolean)
          )
        ),
      ]
    : []

  const initialValues = Object.fromEntries(
    allKeys.map((key) => [
      key,
      presentation?.placeholders.find((p) => p.placeholderKey === key)?.imageSrc ?? '',
    ])
  )

  const [values, setValues] = useState<Record<string, string>>(initialValues)

  useEffect(() => {
    if (open) {
      const current: Record<string, string> = {}
      allKeys.forEach((key) => {
        const found = presentation?.placeholders.find((p) => p.placeholderKey === key)
        current[key] = found?.imageSrc ?? ''
      })
      setValues(current)
    }
  }, [open])

  const handleSave = () => {
    const updates = allKeys.map((key) => ({
      placeholderKey: key,
      imageSrc: values[key] ?? '',
    }))
    store.editor.updatePlaceholders(updates)
    onClose()
  }

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="Manage Placeholders"
      size="md"
    >
      <Stack gap="sm">
        {allKeys.length === 0 ? (
          <Text size="sm" c="dimmed">
            No placeholder images found in this presentation.
          </Text>
        ) : (
          allKeys.map((key) => (
            <TextInput
              key={key}
              label={key}
              placeholder="https://example.com/image.jpg"
              value={values[key] ?? ''}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [key]: e.currentTarget.value }))
              }
            />
          ))
        )}

        <Group justify="flex-end" mt="sm">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={allKeys.length === 0}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
})

export default PlaceholderManager
