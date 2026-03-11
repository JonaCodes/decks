import { Model, DataTypes, Sequelize } from 'sequelize';
import { Models } from './index';

export default class SlideTemplate extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public metadata!: Record<string, unknown>;
  public userId!: number;
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
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        metadata: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {},
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
      },
      {
        sequelize,
        modelName: 'SlideTemplate',
        tableName: 'slide_templates',
        underscored: true,
      }
    );
  }

  static associate(models: Models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' });
    this.hasMany(models.SlideElement, { foreignKey: 'template_id', as: 'elements' });
    this.hasMany(models.Slide, { foreignKey: 'template_id' });
  }
}
