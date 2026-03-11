import type { Command } from './Command'
import type EditorStore from '../EditorStore'
import type { Slide } from '../../types/presentation'

export class DeleteSlideCommand implements Command {
  description = 'Delete slide'

  constructor(
    private store: EditorStore,
    private slide: Slide,
    private index: number,
  ) {}

  execute() {
    this.store.removeSlide(this.slide.id)
  }

  undo() {
    this.store.insertSlideAt(this.slide, this.index)
  }
}
