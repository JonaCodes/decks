import type { Command } from './Command'
import type EditorStore from '../EditorStore'
import type { Slide } from '../../types/presentation'

export class AddSlideCommand implements Command {
  description = 'Add slide'

  constructor(
    private store: EditorStore,
    private slide: Slide,
  ) {}

  execute() {
    this.store.pushSlide(this.slide)
  }

  undo() {
    this.store.removeSlide(this.slide.id)
  }
}
