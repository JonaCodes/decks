import { DashboardStore } from './DashboardStore';
import { EditorStore } from './EditorStore';
import { PresentationModeStore } from './PresentationModeStore';

export class RootStore {
  dashboard: DashboardStore;
  editor: EditorStore;
  presentationMode: PresentationModeStore;

  constructor() {
    this.dashboard = new DashboardStore();
    this.editor = new EditorStore();
    this.presentationMode = new PresentationModeStore();
  }
}
