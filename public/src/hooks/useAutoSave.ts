import { useEffect, useRef, useCallback } from 'react'
import { reaction } from 'mobx'
import { useStore } from '../stores/StoreContext'
import { api } from '../services/api'
import type { BulkSavePayload } from '../types/presentation'

const AUTO_SAVE_DELAY_MS = 30_000

export function useAutoSave() {
  const store = useStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(async () => {
    if (store.editor.mode === 'template') {
      const { templateData } = store.editor
      if (!templateData) return
      store.editor.setSaveStatus('saving')
      try {
        const updated = await api.updateTemplate(templateData.id, {
          name: templateData.name,
          description: templateData.description ?? undefined,
          elements: templateData.elements,
        })
        store.editor.setTemplateData(updated)
        store.editor.setSaveStatus('saved')
      } catch {
        store.editor.setSaveStatus('error')
      }
      return
    }

    const { presentation } = store.editor
    if (!presentation) return

    store.editor.setSaveStatus('saving')
    try {
      const payload: BulkSavePayload = {
        slides: presentation.slides.map(slide => ({
          id: slide.id > 0 ? slide.id : undefined,  // omit negative (unsaved) IDs
          presentationId: slide.presentationId,
          templateId: slide.templateId,
          order: slide.order,
          backgroundColor: slide.backgroundColor,
          elements: slide.elements.map(el => ({
            id: el.id > 0 ? el.id : undefined,
            slideId: el.slideId,
            templateId: el.templateId,
            type: el.type,
            x: el.x, y: el.y, width: el.width, height: el.height,
            rotation: el.rotation,
            revealOrder: el.revealOrder,
            properties: el.properties,
            zIndex: el.zIndex,
          })),
        })),
        placeholders: presentation.placeholders.map(p => ({
          id: p.id > 0 ? p.id : undefined,
          presentationId: p.presentationId,
          placeholderKey: p.placeholderKey,
          imageSrc: p.imageSrc,
        })),
      }

      await api.savePresentation(presentation.id, payload)
      // Refresh presentation from server to get real server-assigned IDs
      const updated = await api.getPresentation(presentation.id)
      store.editor.setPresentation(updated)
      store.editor.setSaveStatus('saved')
    } catch {
      store.editor.setSaveStatus('error')
    }
  }, [store])

  // Manual save trigger (exported for Cmd+S)
  const saveNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    save()
  }, [save])

  useEffect(() => {
    // React to isDirty changes using MobX reaction
    const disposer = reaction(
      () => store.editor.isDirty,
      (isDirty) => {
        if (!isDirty) return
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          save()
        }, AUTO_SAVE_DELAY_MS)
      }
    )
    return () => {
      disposer()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [store, save])

  return { save: saveNow }
}
