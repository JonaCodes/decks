import { forwardRef } from 'react'
import { observer } from 'mobx-react-lite'
import Moveable from 'react-moveable'
import { useStore } from '../../stores/StoreContext'
import { DEFAULT_GRID_SIZE } from './constants'
import { MoveElementCommand } from '../../stores/commands/MoveElementCommand'
import { ResizeElementCommand } from '../../stores/commands/ResizeElementCommand'
import { RotateElementCommand } from '../../stores/commands/RotateElementCommand'
import { CompositeCommand } from '../../stores/commands/CompositeCommand'

interface Props {
  elementRefs: Map<number, HTMLDivElement>
}

const MoveableManager = observer(
  forwardRef<Moveable, Props>(({ elementRefs }, ref) => {
    const store = useStore()
    const { selectedElementIds, editingElementId, currentSlide } = store.editor

    if (!currentSlide || selectedElementIds.length === 0 || editingElementId !== null) {
      return null
    }

    const targets = selectedElementIds
      .map((id) => elementRefs.get(id))
      .filter((el): el is HTMLDivElement => el !== undefined)

    if (targets.length === 0) return null

    const getElementId = (target: HTMLElement | SVGElement): number => {
      return parseInt(target.getAttribute('data-element-id') ?? '0', 10)
    }

    const scheduleRectUpdate = () => {
      requestAnimationFrame(() => {
        if (ref && 'current' in ref && ref.current) {
          ref.current.updateRect()
        }
      })
    }

    return (
      <Moveable
        ref={ref}
        target={targets.length === 1 ? targets[0] : targets}
        draggable={true}
        resizable={true}
        rotatable={true}
        snappable={true}
        snapGridWidth={DEFAULT_GRID_SIZE}
        snapGridHeight={DEFAULT_GRID_SIZE}
        keepRatio={false}
        onDrag={({ target, transform }) => {
          target.style.transform = transform
        }}
        onDragGroup={({ events }) => {
          events.forEach(({ target, transform }) => {
            target.style.transform = transform
          })
        }}
        onDragEnd={({ target, lastEvent }) => {
          if (!lastEvent) return
          const id = getElementId(target)
          const { translate } = lastEvent
          const element = currentSlide.elements.find((e) => e.id === id)
          if (!element) return
          const cmd = new MoveElementCommand(
            store.editor,
            currentSlide.id,
            id,
            element.x,
            element.y,
            element.x + translate[0],
            element.y + translate[1],
          )
          store.editor.executeCommand(cmd)
          target.style.transform = `rotate(${element.rotation}deg)`
          scheduleRectUpdate()
        }}
        onDragGroupEnd={({ events }) => {
          const cmds = events.flatMap(({ target, lastEvent }) => {
            if (!lastEvent) return []
            const id = getElementId(target)
            const { translate } = lastEvent
            const element = currentSlide.elements.find((e) => e.id === id)
            if (!element) return []
            return [
              new MoveElementCommand(
                store.editor,
                currentSlide.id,
                id,
                element.x,
                element.y,
                element.x + translate[0],
                element.y + translate[1],
              ),
            ]
          })
          if (cmds.length > 0) {
            store.editor.executeCommand(new CompositeCommand(cmds, 'Move elements'))
          }
          events.forEach(({ target, lastEvent }) => {
            if (!lastEvent) return
            const id = getElementId(target)
            const element = currentSlide.elements.find((e) => e.id === id)
            if (element) {
              target.style.transform = `rotate(${element.rotation}deg)`
            }
          })
          scheduleRectUpdate()
        }}
        onResize={({ target, width, height, drag }) => {
          target.style.width = `${width}px`
          target.style.height = `${height}px`
          target.style.transform = drag.transform
        }}
        onResizeEnd={({ target, lastEvent }) => {
          if (!lastEvent) return
          const id = getElementId(target)
          const element = currentSlide.elements.find((e) => e.id === id)
          if (!element) return
          const { width, height, drag } = lastEvent
          const cmd = new ResizeElementCommand(
            store.editor,
            currentSlide.id,
            id,
            element.x,
            element.y,
            element.width,
            element.height,
            element.x + drag.translate[0],
            element.y + drag.translate[1],
            width,
            height,
          )
          store.editor.executeCommand(cmd)
          target.style.width = ''
          target.style.height = ''
          target.style.transform = `rotate(${element.rotation}deg)`
          scheduleRectUpdate()
        }}
        onRotate={({ target, transform }) => {
          target.style.transform = transform
        }}
        onRotateEnd={({ target, lastEvent }) => {
          if (!lastEvent) return
          const id = getElementId(target)
          const element = currentSlide.elements.find((e) => e.id === id)
          if (!element) return
          const cmd = new RotateElementCommand(
            store.editor,
            currentSlide.id,
            id,
            element.rotation,
            lastEvent.rotation,
          )
          store.editor.executeCommand(cmd)
          target.style.transform = `rotate(${lastEvent.rotation}deg)`
          scheduleRectUpdate()
        }}
      />
    )
  }),
)

export default MoveableManager
