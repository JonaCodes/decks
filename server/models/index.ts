import sequelize from '../config/database';
import Event from './event';

const models = {
  Event,
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
