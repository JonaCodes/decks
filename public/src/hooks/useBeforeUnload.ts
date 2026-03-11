import { useEffect } from 'react'
import { useStore } from '../stores/StoreContext'

export function useBeforeUnload() {
  const store = useStore()

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (store.editor.isDirty) {
        e.preventDefault()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [store.editor])
}
