import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../stores/StoreContext'
import { api } from '../services/api'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../components/editor/constants'
import PresentationSlide from '../components/presentation/PresentationSlide'

const PresentationModePage = observer(() => {
  const { id } = useParams()
  const navigate = useNavigate()
  const store = useStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Load presentation
  useEffect(() => {
    if (!id) return
    api.getPresentation(parseInt(id, 10)).then((presentation) => {
      store.presentationMode.setPresentation(presentation)
    })
  }, [id])

  // Request fullscreen on mount
  useEffect(() => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen().catch(() => {
        // Fullscreen not available, continue without it
      })
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [])

  // Scale canvas to fit viewport
  useEffect(() => {
    const updateScale = () => {
      const factor = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT)
      setScale(factor)
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          store.presentationMode.next()
          break
        case 'ArrowLeft':
        case 'Backspace':
          e.preventDefault()
          store.presentationMode.previous()
          break
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {})
          }
          navigate(-1)
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [store.presentationMode, navigate])

  const { presentation, currentSlide } = store.presentationMode

  if (!presentation || !currentSlide) {
    return (
      <div
        style={{
          background: '#000',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        background: '#000',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={() => store.presentationMode.next()}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <PresentationSlide
          slide={currentSlide}
          placeholders={presentation.placeholders}
        />
      </div>
    </div>
  )
})

export default PresentationModePage
