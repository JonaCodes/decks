import { makeAutoObservable } from 'mobx';
import { api } from '../services/api';
import type { Presentation, SlideTemplate } from '../types/presentation';

export class DashboardStore {
  presentations: Presentation[] = [];
  templates: SlideTemplate[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadAll(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const [presentations, templates] = await Promise.all([
        api.getPresentations(),
        api.getTemplates(),
      ]);
      this.presentations = presentations;
      this.templates = templates;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load data';
    } finally {
      this.loading = false;
    }
  }

  async createPresentation(name: string): Promise<Presentation> {
    const presentation = await api.createPresentation(name);
    this.presentations.push(presentation);
    return presentation;
  }

  async deletePresentation(id: number): Promise<void> {
    await api.deletePresentation(id);
    this.presentations = this.presentations.filter((p) => p.id !== id);
  }

  async createTemplate(name: string): Promise<SlideTemplate> {
    const template = await api.createTemplate(name);
    this.templates.push(template);
    return template;
  }

  async deleteTemplate(id: number): Promise<void> {
    await api.deleteTemplate(id);
    this.templates = this.templates.filter((t) => t.id !== id);
  }
}
