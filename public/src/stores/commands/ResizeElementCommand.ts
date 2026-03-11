import type { Command } from './Command'
import type EditorStore from '../EditorStore'

export class ResizeElementCommand implements Command {
  description = 'Resize element'

  constructor(
    private store: EditorStore,
    private slideId: number,
    private elementId: number,
    private prevX: number,
    private prevY: number,
    private prevWidth: number,
    private prevHeight: number,
    private nextX: number,
    private nextY: number,
    private nextWidth: number,
    private nextHeight: number,
  ) {}

  execute() {
    this.store.updateElement(this.slideId, this.elementId, {
      x: this.nextX,
      y: this.nextY,
      width: this.nextWidth,
      height: this.nextHeight,
    })
  }

  undo() {
    this.store.updateElement(this.slideId, this.elementId, {
      x: this.prevX,
      y: this.prevY,
      width: this.prevWidth,
      height: this.prevHeight,
    })
  }
}
