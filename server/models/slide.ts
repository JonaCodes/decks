import { Model, DataTypes, Sequelize } from 'sequelize';
import { Models } from './index';

const DEFAULT_BACKGROUND_COLOR = '#ffffff';

export default class Slide extends Model {
  public id!: number;
  public presentationId!: number;
  public templateId!: number | null;
  public order!: number;
  public backgroundColor!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        presentationId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'presentations',
            key: 'id',
          },
        },
        templateId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'slide_templates',
            key: 'id',
          },
        },
        order: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        backgroundColor: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: DEFAULT_BACKGROUND_COLOR,
        },
      },
      {
        sequelize,
        modelName: 'Slide',
        tableName: 'slides',
        underscored: true,
      }
    );
  }

  static associate(models: Models) {
    this.belongsTo(models.Presentation, { foreignKey: 'presentation_id' });
    this.belongsTo(models.SlideTemplate, { foreignKey: 'template_id' });
    this.hasMany(models.SlideElement, {
      foreignKey: 'slide_id',
      as: 'elements',
      onDelete: 'CASCADE',
    });
  }
}
