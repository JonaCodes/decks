import { observer } from 'mobx-react-lite'
import type { SlideElement } from '../../../types/presentation'

interface Props {
  element: SlideElement
  isSelected: boolean
  isEditing: boolean
}

const ShapeElement = observer(({ element }: Props) => {
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
})

export default ShapeElement
