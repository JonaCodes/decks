import { observer } from 'mobx-react-lite'
import { useRef, useEffect } from 'react'
import { useStore } from '../../../stores/StoreContext'
import type { SlideElement } from '../../../types/presentation'

interface Props {
  element: SlideElement
  isSelected: boolean
  isEditing: boolean
}

const SplitColorTextElement = observer(({ element, isEditing }: Props) => {
  const store = useStore()
  const ref1 = useRef<HTMLSpanElement>(null)
  const ref2 = useRef<HTMLSpanElement>(null)
  const originalText1Ref = useRef('')
  const originalText2Ref = useRef('')
  const props = element.properties as {
    text1?: string
    text2?: string
    color1?: string
    color2?: string
    fontSize?: number
    fontWeight?: string
    fontFamily?: string
    textAlign?: string
  }

  useEffect(() => {
    if (isEditing) {
      originalText1Ref.current = props.text1 ?? 'Hello'
      originalText2Ref.current = props.text2 ?? 'World'
      ref1.current?.focus()
    }
  }, [isEditing])

  const commitSpan = (span: 'text1' | 'text2', value: string) => {
    store.editor.updateElement(element.slideId!, element.id, {
      properties: { ...element.properties, [span]: value },
    })
  }

  const handleBlur1 = (e: React.FocusEvent) => {
    if (ref2.current && e.relatedTarget === ref2.current) {
      // Focus moving to span 2 — commit text1 but stay in edit mode
      if (ref1.current) commitSpan('text1', ref1.current.innerText)
      return
    }
    if (ref1.current) commitSpan('text1', ref1.current.innerText)
    store.editor.setEditingElement(null)
  }

  const handleBlur2 = () => {
    if (ref2.current) {
      commitSpan('text2', ref2.current.innerText)
      store.editor.setEditingElement(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (ref1.current) ref1.current.innerText = originalText1Ref.current
      if (ref2.current) ref2.current.innerText = originalText2Ref.current
      store.editor.setEditingElement(null)
    }
  }

  const sharedStyle: React.CSSProperties = {
    fontSize: props.fontSize,
    fontWeight: props.fontWeight,
    fontFamily: props.fontFamily,
    outline: 'none',
    userSelect: isEditing ? 'text' : 'none',
  }

  if (isEditing) {
    return (
      <div
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <span
          ref={ref1}
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: props.text1 ?? 'Hello' }}
          onBlur={handleBlur1}
          onKeyDown={handleKeyDown}
          style={{ ...sharedStyle, color: props.color1 }}
        />
        <span
          ref={ref2}
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: props.text2 ?? 'World' }}
          onBlur={handleBlur2}
          onKeyDown={handleKeyDown}
          style={{ ...sharedStyle, color: props.color2, marginLeft: 8 }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <span style={{ ...sharedStyle, color: props.color1 }}>
        {props.text1 ?? 'Hello'}
      </span>
      <span style={{ ...sharedStyle, color: props.color2, marginLeft: 8 }}>
        {props.text2 ?? 'World'}
      </span>
    </div>
  )
})

export default SplitColorTextElement
