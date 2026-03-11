import type { Command } from './Command'
import type EditorStore from '../EditorStore'
import type { SlideElement } from '../../types/presentation'

export class AddElementCommand implements Command {
  description = 'Add element'

  constructor(
    private store: EditorStore,
    private slideId: number,
    private element: SlideElement,
  ) {}

  execute() {
    this.store.addElementWithId(this.slideId, this.element)
  }

  undo() {
    this.store.removeElement(this.slideId, this.element.id)
  }
}
