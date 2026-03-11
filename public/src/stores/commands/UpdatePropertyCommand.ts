import type { Command } from './Command'
import type EditorStore from '../EditorStore'
import type { SlideElement } from '../../types/presentation'

export class UpdatePropertyCommand implements Command {
  description = 'Update element properties'

  constructor(
    private store: EditorStore,
    private slideId: number,
    private elementId: number,
    private prevProperties: Record<string, unknown>,
    private nextProperties: Record<string, unknown>,
  ) {}

  execute() {
    this.store.updateElement(this.slideId, this.elementId, {
      properties: this.nextProperties,
    } as Partial<SlideElement>)
  }

  undo() {
    this.store.updateElement(this.slideId, this.elementId, {
      properties: this.prevProperties,
    } as Partial<SlideElement>)
  }
}
