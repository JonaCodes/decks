export const CANVAS_WIDTH = 1920
export const CANVAS_HEIGHT = 1080
export const DEFAULT_GRID_SIZE = 20

export const ELEMENT_CENTER_X = 960
export const ELEMENT_CENTER_Y = 540

export const DEFAULT_TEXT_WIDTH = 400
export const DEFAULT_TEXT_HEIGHT = 100
export const DEFAULT_SHAPE_SIZE = 200

export const ELEMENT_DEFAULTS: Record<string, {
  properties: Record<string, unknown>
  width: number
  height: number
}> = {
  text: {
    properties: {
      content: 'Text',
      fontSize: 24,
      fontWeight: 'normal',
      fontFamily: 'Figtree',
      color: '#000000',
      textAlign: 'left',
    },
    width: DEFAULT_TEXT_WIDTH,
    height: DEFAULT_TEXT_HEIGHT,
  },
  split_color_text: {
    properties: {
      text1: 'Hello',
      text2: 'World',
      color1: '#000000',
      color2: '#6366f1',
      fontSize: 36,
      fontWeight: 'bold',
      fontFamily: 'Figtree',
    },
    width: DEFAULT_TEXT_WIDTH,
    height: DEFAULT_TEXT_HEIGHT,
  },
  shape: {
    properties: {
      borderRadius: 0,
      backgroundColor: '#6366f1',
      borderColor: 'transparent',
      borderWidth: 0,
      shadow: '',
    },
    width: DEFAULT_SHAPE_SIZE,
    height: DEFAULT_SHAPE_SIZE,
  },
  image: {
    properties: {
      src: '',
      objectFit: 'cover',
      borderRadius: 0,
      shadow: '',
    },
    width: DEFAULT_SHAPE_SIZE,
    height: DEFAULT_SHAPE_SIZE,
  },
  placeholder_image: {
    properties: {
      placeholderKey: 'logo',
      objectFit: 'contain',
      borderRadius: 0,
      shadow: '',
    },
    width: DEFAULT_SHAPE_SIZE,
    height: DEFAULT_SHAPE_SIZE,
  },
}
