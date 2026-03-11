import { observer } from 'mobx-react-lite'
import { useRef, useEffect } from 'react'
import { useStore } from '../../../stores/StoreContext'
import type { SlideElement } from '../../../types/presentation'

interface Props {
  element: SlideElement
  isSelected: boolean
  isEditing: boolean
}

const TextElement = observer(({ element, isEditing }: Props) => {
  const store = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const originalContent = useRef<string>('')
  const props = element.properties as {
    content?: string
    fontSize?: number
    fontWeight?: string
    fontFamily?: string
    color?: string
    textAlign?: string
  }

  useEffect(() => {
    if (isEditing && ref.current) {
      originalContent.current = ref.current.innerText
      ref.current.focus()
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [isEditing])

  const handleBlur = () => {
    if (!ref.current) return
    const newContent = ref.current.innerText
    store.editor.updateElement(element.slideId!, element.id, {
      properties: { ...element.properties, content: newContent },
    })
    store.editor.setEditingElement(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (ref.current) {
        ref.current.innerText = originalContent.current
      }
      store.editor.setEditingElement(null)
    }
  }

  const textStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    fontSize: props.fontSize,
    fontWeight: props.fontWeight,
    fontFamily: props.fontFamily,
    color: props.color,
    textAlign: props.textAlign as React.CSSProperties['textAlign'],
    wordBreak: 'break-word',
    overflow: 'hidden',
  }

  if (isEditing) {
    return (
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: props.content ?? 'Text' }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPointerDown={(e) => e.stopPropagation()}
        style={{ ...textStyle, outline: 'none', cursor: 'text' }}
      />
    )
  }

  return (
    <div
      style={{
        ...textStyle,
        outline: 'none',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {props.content ?? 'Text'}
    </div>
  )
})

export default TextElement
