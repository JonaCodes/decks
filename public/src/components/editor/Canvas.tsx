import { observer } from 'mobx-react-lite'
import { useRef, useEffect, useState, useCallback } from 'react'
import { flushSync } from 'react-dom'
import Moveable from 'react-moveable'
import { useStore } from '../../stores/StoreContext'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants'
import ElementRenderer from './elements/ElementRenderer'
import MoveableManager from './MoveableManager'

const Canvas = observer(() => {
  const store = useStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const moveableRef = useRef<Moveable>(null)
  const [scale, setScale] = useState(1)
  const elementRefsMap = useRef<Map<number, HTMLDivElement>>(new Map())

  const { currentSlide, currentElements, selectedElementIds, editingElementId } = store.editor

  const updateScale = useCallback(() => {
    if (!containerRef.current) return
    const { clientWidth, clientHeight } = containerRef.current
    const factor = Math.min(clientWidth / CANVAS_WIDTH, clientHeight / CANVAS_HEIGHT)
    setScale(factor)
  }, [])

  useEffect(() => {
    updateScale()
    const observer = new ResizeObserver(updateScale)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [updateScale])

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      store.editor.clearSelection()
    }
  }

  const handleElementPointerDown = (e: React.PointerEvent, elementId: number) => {
    e.stopPropagation()
    if (editingElementId === elementId) return

    const alreadySelected = selectedElementIds.includes(elementId)

    if (!alreadySelected) {
      e.nativeEvent.stopImmediatePropagation()
    }

    flushSync(() => {
      store.editor.selectElement(elementId, e.shiftKey)
    })

    if (!alreadySelected) {
      const nativeEvent = e.nativeEvent
      moveableRef.current?.waitToChangeTarget().then(() => {
        moveableRef.current?.dragStart(nativeEvent)
      })
    }
  }

  const handleElementDoubleClick = (e: React.MouseEvent, elementId: number) => {
    e.stopPropagation()
    store.editor.selectElement(elementId)
    store.editor.setEditingElement(elementId)
  }

  const setElementRef = (id: number, el: HTMLDivElement | null) => {
    if (el) {
      elementRefsMap.current.set(id, el)
    } else {
      elementRefsMap.current.delete(id)
    }
  }

  const backgroundColor = currentSlide?.backgroundColor

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e5e7eb',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          position: 'relative',
          backgroundColor,
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          flexShrink: 0,
        }}
        onClick={handleCanvasClick}
      >
        {currentElements.map((element) => (
          <div
            key={element.id}
            ref={(el) => setElementRef(element.id, el)}
            data-element-id={String(element.id)}
            onPointerDown={(e) => handleElementPointerDown(e, element.id)}
            onDoubleClick={(e) => handleElementDoubleClick(e, element.id)}
            style={{
              position: 'absolute',
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              transform: `rotate(${element.rotation}deg)`,
              zIndex: element.zIndex,
              outline: selectedElementIds.includes(element.id) && editingElementId !== element.id
                ? '2px solid #6366f1'
                : 'none',
              cursor: editingElementId === element.id ? 'text' : 'move',
            }}
          >
            <ElementRenderer
              element={element}
              isSelected={selectedElementIds.includes(element.id)}
              isEditing={editingElementId === element.id}
            />
          </div>
        ))}

        <MoveableManager ref={moveableRef} elementRefs={elementRefsMap.current} />
      </div>
    </div>
  )
})

export default Canvas
