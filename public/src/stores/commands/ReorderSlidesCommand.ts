import type { Command } from './Command'
import type EditorStore from '../EditorStore'

export class ReorderSlidesCommand implements Command {
  description = 'Reorder slides'

  constructor(
    private store: EditorStore,
    private fromIndex: number,
    private toIndex: number,
  ) {}

  execute() {
    this.store.reorderSlides(this.fromIndex, this.toIndex)
  }

  undo() {
    this.store.reorderSlides(this.toIndex, this.fromIndex)
  }
}
