import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { Modal, Button, Stack, Group, Text, ActionIcon } from '@mantine/core'
import { IconPlus, IconTrash, IconChevronUp, IconChevronDown } from '@tabler/icons-react'
import { useStore } from '../../stores/StoreContext'
import { api } from '../../services/api'

const THUMBNAIL_WIDTH = 160
const THUMBNAIL_HEIGHT = 90

const LeftPanel = observer(() => {
  const store = useStore()
  const [modalOpen, setModalOpen] = useState(false)

  const { presentation, currentSlideIndex } = store.editor

  if (!presentation) return null

  const handleAddBlankSlide = async () => {
    setModalOpen(false)
    const { slide } = await api.addSlide(presentation.id)
    presentation.slides.push(slide)
    store.editor.setCurrentSlideIndex(presentation.slides.length - 1)
  }

  const handleAddFromTemplate = async (templateId: number) => {
    setModalOpen(false)
    const { slide } = await api.addSlide(presentation.id, templateId)
    presentation.slides.push(slide)
    store.editor.setCurrentSlideIndex(presentation.slides.length - 1)
  }

  const handleDeleteSlide = async (index: number) => {
    if (presentation.slides.length <= 1) return
    const slide = presentation.slides[index]
    await api.deleteSlide(slide.id)
    presentation.slides.splice(index, 1)
    const nextIndex = Math.min(index, presentation.slides.length - 1)
    store.editor.setCurrentSlideIndex(nextIndex)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    store.editor.reorderSlides(index, index - 1)
  }

  const handleMoveDown = (index: number) => {
    if (index === presentation.slides.length - 1) return
    store.editor.reorderSlides(index, index + 1)
  }

  return (
    <div
      style={{
        width: 200,
        borderRight: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {presentation.slides.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => store.editor.setCurrentSlideIndex(index)}
            style={{
              cursor: 'pointer',
              borderRadius: 6,
              border: index === currentSlideIndex ? '2px solid #6366f1' : '2px solid transparent',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: THUMBNAIL_WIDTH,
                height: THUMBNAIL_HEIGHT,
                backgroundColor: slide.backgroundColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size="xs" c="dimmed">
                {slide.elements.length} element{slide.elements.length !== 1 ? 's' : ''}
              </Text>
            </div>

            <Group
              gap={2}
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ActionIcon
                size="xs"
                variant="subtle"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
              >
                <IconChevronUp size={10} />
              </ActionIcon>
              <ActionIcon
                size="xs"
                variant="subtle"
                onClick={() => handleMoveDown(index)}
                disabled={index === presentation.slides.length - 1}
              >
                <IconChevronDown size={10} />
              </ActionIcon>
              <ActionIcon
                size="xs"
                variant="subtle"
                color="red"
                onClick={() => handleDeleteSlide(index)}
                disabled={presentation.slides.length <= 1}
              >
                <IconTrash size={10} />
              </ActionIcon>
            </Group>

            <Text
              size="xs"
              style={{ textAlign: 'center', padding: '2px 0', fontSize: 11, color: '#6b7280' }}
            >
              {index + 1}
            </Text>
          </div>
        ))}
      </div>

      <div style={{ padding: 8, borderTop: '1px solid #e5e7eb' }}>
        <Button
          leftSection={<IconPlus size={14} />}
          variant="light"
          size="xs"
          fullWidth
          onClick={() => setModalOpen(true)}
        >
          Add Slide
        </Button>
      </div>

      <AddSlideModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddBlank={handleAddBlankSlide}
        onAddFromTemplate={handleAddFromTemplate}
      />
    </div>
  )
})

interface AddSlideModalProps {
  open: boolean
  onClose: () => void
  onAddBlank: () => void
  onAddFromTemplate: (templateId: number) => void
}

const AddSlideModal = observer(({ open, onClose, onAddBlank, onAddFromTemplate }: AddSlideModalProps) => {
  const store = useStore()
  const templates = store.dashboard.templates

  return (
    <Modal opened={open} onClose={onClose} title="Add Slide" size="sm">
      <Stack gap="sm">
        <Button variant="outline" onClick={onAddBlank} fullWidth>
          Blank Slide
        </Button>

        {templates.length > 0 && (
          <>
            <Text size="sm" fw={600} c="dimmed">
              From Template
            </Text>
            {templates.map((template) => (
              <Button
                key={template.id}
                variant="light"
                onClick={() => onAddFromTemplate(template.id)}
                fullWidth
              >
                {template.name}
              </Button>
            ))}
          </>
        )}
      </Stack>
    </Modal>
  )
})

export default LeftPanel
