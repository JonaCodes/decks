import { observer } from 'mobx-react-lite'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useStore } from '../stores/StoreContext'
import { api } from '../services/api'
import EditorLayout from '../components/editor/EditorLayout'
import { useAutoSave } from '../hooks/useAutoSave'
import { useBeforeUnload } from '../hooks/useBeforeUnload'
import { useEditorKeyboard } from '../hooks/useEditorKeyboard'

const EditorPage = observer(() => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const store = useStore()
  const { save } = useAutoSave()
  const saveRef = useRef(save)
  saveRef.current = save
  useBeforeUnload()
  useEditorKeyboard()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveRef.current()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const isTemplateMode = location.pathname.startsWith('/templates')

    if (isTemplateMode) {
      if (id === 'new') {
        store.editor.setMode('template')
        api.createTemplate('Untitled Template').then((template) => {
          store.editor.setTemplateData(template)
          navigate(`/templates/${template.id}/edit`, { replace: true })
        })
      } else if (id) {
        store.editor.setMode('template')
        api.getTemplate(parseInt(id, 10)).then((template) => {
          store.editor.setTemplateData(template)
        })
      }
    } else if (id) {
      store.editor.setMode('presentation')
      api.getPresentation(parseInt(id, 10)).then((presentation) => {
        store.editor.setPresentation(presentation)
      })
      store.dashboard.loadAll()
    }
  }, [id, location.pathname, navigate, store])

  const isLoading =
    (store.editor.mode === 'presentation' && !store.editor.presentation) ||
    (store.editor.mode === 'template' && id !== 'new' && !store.editor.templateData)

  if (isLoading) {
    return <div style={{ padding: 32 }}>Loading...</div>
  }

  return <EditorLayout />
})

export default EditorPage
