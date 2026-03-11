import { useEffect } from 'react'
import { useStore } from '../stores/StoreContext'
import { DeleteElementCommand } from '../stores/commands/DeleteElementCommand'
import { AddElementCommand } from '../stores/commands/AddElementCommand'
import { CompositeCommand } from '../stores/commands/CompositeCommand'

export function useEditorKeyboard() {
  const store = useStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't fire when editing text inline
      if (store.editor.editingElementId !== null) return
      // Don't fire when focused in an input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return

      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const cmdKey = isMac ? e.metaKey : e.ctrlKey

      if (cmdKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        store.editor.undo()
      } else if (cmdKey && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        store.editor.redo()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        const { selectedElementIds, currentSlide } = store.editor
        if (!currentSlide || selectedElementIds.length === 0) return
        const cmds = selectedElementIds.flatMap(elementId => {
          const element = currentSlide.elements.find(el => el.id === elementId)
          return element ? [new DeleteElementCommand(store.editor, currentSlide.id, element)] : []
        })
        if (cmds.length > 0) {
          store.editor.executeCommand(new CompositeCommand(cmds, 'Delete elements'))
        }
        store.editor.clearSelection()
      } else if (cmdKey && e.key === 'a') {
        e.preventDefault()
        const { currentSlide } = store.editor
        if (!currentSlide) return
        currentSlide.elements.forEach(el => store.editor.selectElement(el.id, true))
      } else if (cmdKey && e.key === 'd') {
        e.preventDefault()
        const { selectedElementIds, currentSlide } = store.editor
        if (!currentSlide || selectedElementIds.length === 0) return
        const cmds = selectedElementIds.flatMap(elementId => {
          const element = currentSlide.elements.find(el => el.id === elementId)
          if (!element) return []
          const duplicate = { ...element, id: -(Date.now() + Math.random()), x: element.x + 20, y: element.y + 20 }
          return [new AddElementCommand(store.editor, currentSlide.id, duplicate)]
        })
        if (cmds.length > 0) {
          store.editor.executeCommand(new CompositeCommand(cmds, 'Duplicate elements'))
        }
      }
      // Note: Cmd+S is handled in EditorPage.tsx
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [store.editor])
}
