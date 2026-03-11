import { makeAutoObservable } from 'mobx';
import type { Presentation, Slide, SlideElement } from '../types/presentation';

export class PresentationModeStore {
  presentation: Presentation | null = null;
  currentSlideIndex = 0;
  revealedCount = 0;

  constructor() {
    makeAutoObservable(this);
  }

  get currentSlide(): Slide | null {
    if (!this.presentation) return null;
    return this.presentation.slides[this.currentSlideIndex] ?? null;
  }

  setPresentation(p: Presentation): void {
    this.presentation = p;
    this.currentSlideIndex = 0;
    this.revealedCount = 0;
  }

  next(): void {
    if (!this.presentation) return;

    const slide = this.currentSlide;
    if (!slide) return;

    const revealableElements = slide.elements
      .filter((e): e is SlideElement & { revealOrder: number } => e.revealOrder !== null)
      .sort((a, b) => a.revealOrder - b.revealOrder);

    if (this.revealedCount < revealableElements.length) {
      this.revealedCount += 1;
    } else {
      const nextIndex = this.currentSlideIndex + 1;
      if (nextIndex < this.presentation.slides.length) {
        this.currentSlideIndex = nextIndex;
        this.revealedCount = 0;
      }
    }
  }

  previous(): void {
    if (!this.presentation) return;

    if (this.revealedCount > 0) {
      this.revealedCount -= 1;
    } else {
      const prevIndex = this.currentSlideIndex - 1;
      if (prevIndex >= 0) {
        this.currentSlideIndex = prevIndex;
        const prevSlide = this.presentation.slides[prevIndex];
        const revealableCount = prevSlide
          ? prevSlide.elements.filter((e) => e.revealOrder !== null).length
          : 0;
        this.revealedCount = revealableCount;
      }
    }
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
    this.revealedCount = 0;
  }
}
