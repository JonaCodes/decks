import { observer } from 'mobx-react-lite'
import type { SlideElement } from '../../../types/presentation'
import TextElement from './TextElement'
import SplitColorTextElement from './SplitColorTextElement'
import ShapeElement from './ShapeElement'
import ImageElement from './ImageElement'
import PlaceholderImageElement from './PlaceholderImageElement'

interface Props {
  element: SlideElement
  isSelected: boolean
  isEditing: boolean
}

const ElementRenderer = observer((props: Props) => {
  switch (props.element.type) {
    case 'text':
      return <TextElement {...props} />
    case 'split_color_text':
      return <SplitColorTextElement {...props} />
    case 'shape':
      return <ShapeElement {...props} />
    case 'image':
      return <ImageElement {...props} />
    case 'placeholder_image':
      return <PlaceholderImageElement {...props} />
  }
})

export default ElementRenderer
