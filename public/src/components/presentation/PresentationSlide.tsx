import { observer } from 'mobx-react-lite'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../stores/StoreContext'
import type { Slide, SlideElement, PresentationPlaceholder } from '../../types/presentation'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../editor/constants'

interface SlideElementRendererProps {
  element: SlideElement
  placeholders: PresentationPlaceholder[]
}

const SlideElementRenderer = ({ element, placeholders }: SlideElementRendererProps) => {
  switch (element.type) {
    case 'text': {
      const props = element.properties as {
        content?: string
        fontSize?: number
        fontWeight?: string
        fontFamily?: string
        color?: string
        textAlign?: string
      }
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            fontSize: props.fontSize ?? 24,
            fontWeight: props.fontWeight ?? 'normal',
            fontFamily: props.fontFamily ?? 'Figtree',
            color: props.color ?? '#000000',
            textAlign: (props.textAlign as React.CSSProperties['textAlign']) ?? 'left',
            wordBreak: 'break-word',
            overflow: 'hidden',
            userSelect: 'none',
          }}
        >
          {props.content ?? 'Text'}
        </div>
      )
    }

    case 'split_color_text': {
      const props = element.properties as {
        text1?: string
        text2?: string
        color1?: string
        color2?: string
        fontSize?: number
        fontWeight?: string
        fontFamily?: string
      }
      const sharedStyle: React.CSSProperties = {
        fontSize: props.fontSize ?? 36,
        fontWeight: props.fontWeight ?? 'bold',
        fontFamily: props.fontFamily ?? 'Figtree',
        userSelect: 'none',
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
          <span style={{ ...sharedStyle, color: props.color1 ?? '#000000' }}>
            {props.text1 ?? 'Hello'}
          </span>
          <span style={{ ...sharedStyle, color: props.color2 ?? '#6366f1', marginLeft: 8 }}>
            {props.text2 ?? 'World'}
          </span>
        </div>
      )
    }

    case 'shape': {
      const props = element.properties as {
        borderRadius?: number
        backgroundColor?: string
        borderColor?: string
        borderWidth?: number
        shadow?: string
      }
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: props.borderRadius ?? 0,
            backgroundColor: props.backgroundColor ?? '#6366f1',
            border: `${props.borderWidth ?? 0}px solid ${props.borderColor ?? 'transparent'}`,
            boxShadow: props.shadow ?? 'none',
          }}
        />
      )
    }

    case 'image': {
      const props = element.properties as {
        src?: string
        objectFit?: string
        borderRadius?: number
        shadow?: string
      }
      const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        borderRadius: props.borderRadius ?? 0,
        boxShadow: props.shadow ?? 'none',
        overflow: 'hidden',
      }
      if (!props.src) {
        return <div style={{ ...containerStyle, backgroundColor: '#d1d5db' }} />
      }
      return (
        <div style={containerStyle}>
          <img
            src={props.src}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: (props.objectFit as React.CSSProperties['objectFit']) ?? 'cover',
              display: 'block',
            }}
          />
        </div>
      )
    }

    case 'placeholder_image': {
      const props = element.properties as {
        placeholderKey?: string
        objectFit?: string
        borderRadius?: number
        shadow?: string
      }
      const key = props.placeholderKey ?? 'logo'
      const placeholder = placeholders.find((p) => p.placeholderKey === key)
      const src = placeholder?.imageSrc
      const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        borderRadius: props.borderRadius ?? 0,
        boxShadow: props.shadow ?? 'none',
        overflow: 'hidden',
      }
      if (!src) {
        return <div style={{ ...containerStyle, backgroundColor: '#d1d5db' }} />
      }
      return (
        <div style={containerStyle}>
          <img
            src={src}
            alt={key}
            style={{
              width: '100%',
              height: '100%',
              objectFit: (props.objectFit as React.CSSProperties['objectFit']) ?? 'contain',
              display: 'block',
            }}
          />
        </div>
      )
    }
  }
}

interface Props {
  slide: Slide
  placeholders: PresentationPlaceholder[]
}

const PresentationSlide = observer(({ slide, placeholders }: Props) => {
  const store = useStore()
  const { revealedCount } = store.presentationMode

  return (
    <div
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: slide.backgroundColor,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {slide.elements
        .slice()
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((element) => {
          const alwaysVisible = element.revealOrder === null
          const isRevealed = alwaysVisible || (element.revealOrder !== null && element.revealOrder <= revealedCount)

          return (
            <AnimatePresence key={element.id}>
              {isRevealed && (
                <motion.div
                  key={element.id}
                  initial={alwaysVisible ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    position: 'absolute',
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    transform: `rotate(${element.rotation}deg)`,
                    zIndex: element.zIndex,
                  }}
                >
                  <SlideElementRenderer element={element} placeholders={placeholders} />
                </motion.div>
              )}
            </AnimatePresence>
          )
        })}
    </div>
  )
})

export default PresentationSlide
