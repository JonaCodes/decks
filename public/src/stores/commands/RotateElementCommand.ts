import type { Command } from './Command'
import type EditorStore from '../EditorStore'

export class RotateElementCommand implements Command {
  description = 'Rotate element'

  constructor(
    private store: EditorStore,
    private slideId: number,
    private elementId: number,
    private prevRotation: number,
    private nextRotation: number,
  ) {}

  execute() {
    this.store.updateElement(this.slideId, this.elementId, { rotation: this.nextRotation })
  }

  undo() {
    this.store.updateElement(this.slideId, this.elementId, { rotation: this.prevRotation })
  }
}
