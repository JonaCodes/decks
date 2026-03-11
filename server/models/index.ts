import sequelize from '../config/database';
import Account from './account';
import User from './user';
import Event from './event';
import LlmTokenUsage from './llm_token_usage';
import LlmBatchTask from './llm_batch_task';
import SlideTemplate from './slideTemplate';
import Presentation from './presentation';
import Slide from './slide';
import SlideElement from './slideElement';
import PresentationPlaceholder from './presentationPlaceholder';

export interface Models {
  User: typeof User;
  Account: typeof Account;
  SlideTemplate: typeof SlideTemplate;
  Presentation: typeof Presentation;
  Slide: typeof Slide;
  SlideElement: typeof SlideElement;
  PresentationPlaceholder: typeof PresentationPlaceholder;
  Event: typeof Event;
  LlmTokenUsage: typeof LlmTokenUsage;
  LlmBatchTask: typeof LlmBatchTask;
}

const models: Models = {
  Account,
  User,
  Event,
  LlmTokenUsage,
  LlmBatchTask,
  SlideTemplate,
  Presentation,
  Slide,
  SlideElement,
  PresentationPlaceholder,
};

Object.values(models).forEach((model) => {
  if (typeof model.initialize === 'function') {
    model.initialize(sequelize);
  }
});

Object.values(models).forEach((model) => {
  if ('associate' in model && typeof model.associate === 'function') {
    model.associate(models);
  }
});

export { sequelize };
export default models;
