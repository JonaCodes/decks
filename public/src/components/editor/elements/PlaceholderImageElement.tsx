import { observer } from 'mobx-react-lite'
import { useStore } from '../../../stores/StoreContext'
import type { SlideElement } from '../../../types/presentation'

interface Props {
  element: SlideElement
  isSelected: boolean
  isEditing: boolean
}

const PLACEHOLDER_BG = '#d1d5db'

const PlaceholderImageElement = observer(({ element }: Props) => {
  const store = useStore()
  const props = element.properties as {
    placeholderKey?: string
    objectFit?: string
    borderRadius?: number
    shadow?: string
  }

  const key = props.placeholderKey ?? 'logo'
  const placeholder = store.editor.placeholders.find((p) => p.placeholderKey === key)
  const src = placeholder?.imageSrc

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: props.borderRadius ?? 0,
    boxShadow: props.shadow ?? 'none',
    overflow: 'hidden',
  }

  if (!src) {
    return (
      <div
        style={{
          ...containerStyle,
          backgroundColor: PLACEHOLDER_BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: 14,
          fontFamily: 'Figtree',
        }}
      >
        {key}
      </div>
    )
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
})

export default PlaceholderImageElement
