import type { Command } from './Command'
import type EditorStore from '../EditorStore'
import type { SlideElement } from '../../types/presentation'

export class DeleteElementCommand implements Command {
  description = 'Delete element'

  constructor(
    private store: EditorStore,
    private slideId: number,
    private element: SlideElement,
  ) {}

  execute() {
    this.store.removeElement(this.slideId, this.element.id)
  }

  undo() {
    this.store.addElementWithId(this.slideId, this.element)
  }
}
