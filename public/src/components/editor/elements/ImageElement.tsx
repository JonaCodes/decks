import { observer } from 'mobx-react-lite'
import type { SlideElement } from '../../../types/presentation'

interface Props {
  element: SlideElement
  isSelected: boolean
  isEditing: boolean
}

const PLACEHOLDER_BG = '#d1d5db'

const ImageElement = observer(({ element }: Props) => {
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
        Image
      </div>
    )
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
})

export default ImageElement
