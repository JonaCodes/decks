import type { Command } from './Command'
import type EditorStore from '../EditorStore'

export class MoveElementCommand implements Command {
  description = 'Move element'

  constructor(
    private store: EditorStore,
    private slideId: number,
    private elementId: number,
    private prevX: number,
    private prevY: number,
    private nextX: number,
    private nextY: number,
  ) {}

  execute() {
    this.store.updateElement(this.slideId, this.elementId, { x: this.nextX, y: this.nextY })
  }

  undo() {
    this.store.updateElement(this.slideId, this.elementId, { x: this.prevX, y: this.prevY })
  }
}
