import { makeAutoObservable } from 'mobx';
import type {
  Presentation,
  Slide,
  SlideElement,
  SlideTemplate,
  PresentationPlaceholder,
} from '../types/presentation';
import { DEFAULT_GRID_SIZE } from '../components/editor/constants';
import type { Command } from './commands/Command';

export type EditorMode = 'presentation' | 'template';
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

const DEFAULT_ZOOM = 1;

export class EditorStore {
  // Data
  presentation: Presentation | null = null;
  templateData: SlideTemplate | null = null;
  mode: EditorMode = 'presentation';

  // Canvas state
  currentSlideIndex = 0;
  selectedElementIds: number[] = [];
  editingElementId: number | null = null;
  zoom = DEFAULT_ZOOM;
  gridSize = DEFAULT_GRID_SIZE;
  snapToGrid = true;

  // Save state
  saveStatus: SaveStatus = 'saved';
  isDirty = false;

  // Undo/redo stacks
  undoStack: Command[] = [];
  redoStack: Command[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  get currentSlide(): Slide | null {
    if (this.mode === 'template') {
      if (!this.templateData) return null;
      // Return a synthetic slide-like object for template mode
      return {
        id: 0,
        presentationId: 0,
        templateId: this.templateData.id,
        order: 0,
        backgroundColor: '#ffffff',
        elements: this.templateData.elements,
        createdAt: '',
        updatedAt: '',
      };
    }
    if (!this.presentation) return null;
    return this.presentation.slides[this.currentSlideIndex] ?? null;
  }

  get currentElements(): SlideElement[] {
    if (this.mode === 'template') {
      return this.templateData?.elements ?? [];
    }
    return this.currentSlide?.elements ?? [];
  }

  get placeholders(): PresentationPlaceholder[] {
    return this.presentation?.placeholders ?? [];
  }

  setMode(mode: EditorMode): void {
    this.mode = mode;
  }

  setPresentation(p: Presentation): void {
    this.presentation = p;
    this.currentSlideIndex = 0;
    this.selectedElementIds = [];
    this.editingElementId = null;
    this.saveStatus = 'saved';
    this.isDirty = false;
  }

  setTemplateData(t: SlideTemplate): void {
    this.templateData = t;
    this.mode = 'template';
  }

  setTemplateName(name: string): void {
    if (!this.templateData) return;
    this.templateData.name = name;
    this.markDirty();
  }

  setCurrentSlideIndex(i: number): void {
    this.currentSlideIndex = i;
    this.selectedElementIds = [];
    this.editingElementId = null;
  }

  selectElement(id: number, multi = false): void {
    if (multi) {
      if (this.selectedElementIds.includes(id)) {
        this.selectedElementIds = this.selectedElementIds.filter(
          (eid) => eid !== id
        );
      } else {
        this.selectedElementIds = [...this.selectedElementIds, id];
      }
    } else {
      this.selectedElementIds = [id];
    }
  }

  clearSelection(): void {
    this.selectedElementIds = [];
    this.editingElementId = null;
  }

  setEditingElement(id: number | null): void {
    this.editingElementId = id;
  }

  markDirty(): void {
    this.isDirty = true;
    this.saveStatus = 'unsaved';
  }

  setSaveStatus(s: SaveStatus): void {
    this.saveStatus = s;
    if (s === 'saved') {
      this.isDirty = false;
    }
  }

  updateElement(
    slideId: number,
    elementId: number,
    updates: Partial<SlideElement>
  ): void {
    if (this.mode === 'template' && this.templateData) {
      const element = this.templateData.elements.find((e) => e.id === elementId);
      if (!element) return;
      Object.assign(element, updates);
      this.markDirty();
      return;
    }
    if (!this.presentation) return;
    const slide = this.presentation.slides.find((s) => s.id === slideId);
    if (!slide) return;
    const element = slide.elements.find((e) => e.id === elementId);
    if (!element) return;
    Object.assign(element, updates);
    this.markDirty();
  }

  addElement(slideId: number, element: Omit<SlideElement, 'id'>): void {
    if (this.mode === 'template' && this.templateData) {
      const tempId = -(Date.now());
      this.templateData.elements.push({
        ...element,
        id: tempId,
        slideId: null,
        templateId: this.templateData.id,
      });
      this.markDirty();
      return;
    }
    if (!this.presentation) return;
    const slide = this.presentation.slides.find((s) => s.id === slideId);
    if (!slide) return;
    // Use negative IDs for unsaved elements (server assigns positive IDs on save)
    // EditorStore is refreshed with server response after each save (Phase 7)
    const tempId = -(Date.now());
    slide.elements.push({ ...element, id: tempId });
    this.markDirty();
  }

  removeElement(slideId: number, elementId: number): void {
    if (this.mode === 'template' && this.templateData) {
      this.templateData.elements = this.templateData.elements.filter(
        (e) => e.id !== elementId
      );
      this.selectedElementIds = this.selectedElementIds.filter(
        (id) => id !== elementId
      );
      if (this.editingElementId === elementId) {
        this.editingElementId = null;
      }
      this.markDirty();
      return;
    }
    if (!this.presentation) return;
    const slide = this.presentation.slides.find((s) => s.id === slideId);
    if (!slide) return;
    slide.elements = slide.elements.filter((e) => e.id !== elementId);
    this.selectedElementIds = this.selectedElementIds.filter(
      (id) => id !== elementId
    );
    if (this.editingElementId === elementId) {
      this.editingElementId = null;
    }
    this.markDirty();
  }

  updateSlideBackground(slideId: number, color: string): void {
    if (!this.presentation) return;
    const slide = this.presentation.slides.find((s) => s.id === slideId);
    if (!slide) return;
    slide.backgroundColor = color;
    this.markDirty();
  }

  reorderSlides(fromIndex: number, toIndex: number): void {
    if (!this.presentation) return;
    const slides = [...this.presentation.slides];
    const [moved] = slides.splice(fromIndex, 1);
    slides.splice(toIndex, 0, moved);
    this.presentation.slides = slides;
    this.currentSlideIndex = toIndex;
    this.markDirty();
  }

  executeCommand(cmd: Command): void {
    cmd.execute();
    this.undoStack.push(cmd);
    this.redoStack = [];
  }

  undo(): void {
    const cmd = this.undoStack.pop();
    if (!cmd) return;
    cmd.undo();
    this.redoStack.push(cmd);
  }

  redo(): void {
    const cmd = this.redoStack.pop();
    if (!cmd) return;
    cmd.execute();
    this.undoStack.push(cmd);
  }

  addElementWithId(slideId: number, element: SlideElement): void {
    if (this.mode === 'template' && this.templateData) {
      this.templateData.elements.push(element);
      this.markDirty();
      return;
    }
    if (!this.presentation) return;
    const slide = this.presentation.slides.find((s) => s.id === slideId);
    if (!slide) return;
    slide.elements.push(element);
    this.markDirty();
  }

  pushSlide(slide: Slide): void {
    if (!this.presentation) return;
    this.presentation.slides.push(slide);
    this.markDirty();
  }

  removeSlide(slideId: number): void {
    if (!this.presentation) return;
    this.presentation.slides = this.presentation.slides.filter(
      (s) => s.id !== slideId
    );
    if (this.currentSlideIndex >= this.presentation.slides.length) {
      this.currentSlideIndex = Math.max(0, this.presentation.slides.length - 1);
    }
    this.markDirty();
  }

  insertSlideAt(slide: Slide, index: number): void {
    if (!this.presentation) return;
    this.presentation.slides.splice(index, 0, slide);
    this.currentSlideIndex = index;
    this.markDirty();
  }

  updatePlaceholders(
    updates: Array<{ placeholderKey: string; imageSrc: string }>
  ): void {
    if (!this.presentation) return;
    updates.forEach(({ placeholderKey, imageSrc }) => {
      const existing = this.presentation!.placeholders.find(
        (p) => p.placeholderKey === placeholderKey
      );
      if (existing) {
        existing.imageSrc = imageSrc;
      } else {
        this.presentation!.placeholders.push({
          id: -(Date.now()),
          presentationId: this.presentation!.id,
          placeholderKey,
          imageSrc,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });
    this.markDirty();
  }
}
