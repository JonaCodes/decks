import { observer } from 'mobx-react-lite'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Button, Group, Text, TextInput } from '@mantine/core'
import {
  IconChevronDown,
  IconTypography,
  IconLayoutColumns,
  IconSquare,
  IconPhoto,
  IconImageInPicture,
} from '@tabler/icons-react'
import { useStore } from '../../stores/StoreContext'
import { ELEMENT_DEFAULTS, ELEMENT_CENTER_X, ELEMENT_CENTER_Y } from './constants'
import type { SlideElement } from '../../types/presentation'
import PlaceholderManager from './PlaceholderManager'

const SAVE_STATUS_TEXT: Record<string, string> = {
  saved: 'Saved ✓',
  saving: 'Saving...',
  unsaved: 'Unsaved changes',
  error: 'Save failed',
}

const SAVE_STATUS_COLOR: Record<string, string> = {
  saved: '#16a34a',
  saving: '#6b7280',
  unsaved: '#d97706',
  error: '#dc2626',
}

type ElementType = SlideElement['type']

const TopBar = observer(() => {
  const store = useStore()
  const navigate = useNavigate()
  const isTemplateMode = store.editor.mode === 'template'
  const { saveStatus, currentSlide, presentation, templateData } = store.editor
  const [templateName, setTemplateName] = useState(templateData?.name ?? 'Untitled Template')
  const [placeholderManagerOpen, setPlaceholderManagerOpen] = useState(false)

  useEffect(() => {
    if (templateData?.name) {
      setTemplateName(templateData.name)
    }
  }, [templateData?.name])

  const handleAddElement = (type: ElementType) => {
    if (!currentSlide) return
    const defaults = ELEMENT_DEFAULTS[type]
    store.editor.addElement(currentSlide.id, {
      type,
      x: ELEMENT_CENTER_X - defaults.width / 2,
      y: ELEMENT_CENTER_Y - defaults.height / 2,
      width: defaults.width,
      height: defaults.height,
      zIndex: 0,
      rotation: 0,
      revealOrder: null,
      properties: defaults.properties,
      slideId: currentSlide.id,
      templateId: null,
      createdAt: '',
      updatedAt: '',
    })
  }

  const handlePresent = () => {
    if (presentation) {
      navigate(`/presentations/${presentation.id}/present`)
    }
  }

  return (
    <div
      style={{
        height: 52,
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
      }}
    >
      <div style={{ minWidth: 180 }}>
        {isTemplateMode ? (
          <TextInput
            value={templateName}
            onChange={(e) => setTemplateName(e.currentTarget.value)}
            onBlur={(e) => {
              store.editor.setTemplateName(e.currentTarget.value)
            }}
            size="sm"
            variant="unstyled"
            styles={{ input: { fontWeight: 600, fontSize: 15 } }}
          />
        ) : (
          <Link
            to="/dashboard"
            style={{ textDecoration: 'none', color: '#374151', fontWeight: 500, fontSize: 14 }}
          >
            ← Decks
          </Link>
        )}
      </div>

      <Group gap="xs">
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button
              variant="light"
              size="sm"
              rightSection={<IconChevronDown size={14} />}
            >
              Add Element
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconTypography size={16} />}
              onClick={() => handleAddElement('text')}
            >
              Text
            </Menu.Item>
            <Menu.Item
              leftSection={<IconLayoutColumns size={16} />}
              onClick={() => handleAddElement('split_color_text')}
            >
              Split-Color Text
            </Menu.Item>
            <Menu.Item
              leftSection={<IconSquare size={16} />}
              onClick={() => handleAddElement('shape')}
            >
              Shape
            </Menu.Item>
            <Menu.Item
              leftSection={<IconPhoto size={16} />}
              onClick={() => handleAddElement('image')}
            >
              Image
            </Menu.Item>
            <Menu.Item
              leftSection={<IconImageInPicture size={16} />}
              onClick={() => handleAddElement('placeholder_image')}
            >
              Placeholder Image
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Group gap="md" style={{ minWidth: 180, justifyContent: 'flex-end' }}>
        <Text size="sm" style={{ color: SAVE_STATUS_COLOR[saveStatus] }}>
          {SAVE_STATUS_TEXT[saveStatus]}
        </Text>
        {!isTemplateMode && (
          <>
            <Button size="sm" variant="subtle" onClick={() => setPlaceholderManagerOpen(true)}>
              Placeholders
            </Button>
            <Button size="sm" onClick={handlePresent}>
              Present
            </Button>
          </>
        )}
      </Group>

      <PlaceholderManager
        open={placeholderManagerOpen}
        onClose={() => setPlaceholderManagerOpen(false)}
      />
    </div>
  )
})

export default TopBar
