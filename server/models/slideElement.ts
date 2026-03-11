import { Model, DataTypes, Sequelize } from 'sequelize';
import { Models } from './index';

const SLIDE_ELEMENT_TYPES = ['text', 'split_color_text', 'shape', 'image', 'placeholder_image'] as const;
export type SlideElementType = typeof SLIDE_ELEMENT_TYPES[number];

export default class SlideElement extends Model {
  public id!: number;
  public slideId!: number | null;
  public templateId!: number | null;
  public type!: SlideElementType;
  public x!: number;
  public y!: number;
  public width!: number;
  public height!: number;
  public rotation!: number;
  public revealOrder!: number | null;
  public properties!: Record<string, unknown>;
  public zIndex!: number;
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
        slideId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'slides',
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
        type: {
          type: DataTypes.ENUM(...SLIDE_ELEMENT_TYPES),
          allowNull: false,
        },
        x: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        y: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        width: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        height: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        rotation: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0,
        },
        revealOrder: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        properties: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {},
        },
        zIndex: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: 'SlideElement',
        tableName: 'slide_elements',
        underscored: true,
      }
    );
  }

  static associate(models: Models) {
    this.belongsTo(models.Slide, { foreignKey: 'slide_id' });
    this.belongsTo(models.SlideTemplate, { foreignKey: 'template_id' });
  }
}
