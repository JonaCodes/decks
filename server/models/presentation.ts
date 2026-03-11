import { Model, DataTypes, Sequelize } from 'sequelize';
import { Models } from './index';

export default class Presentation extends Model {
  public id!: number;
  public name!: string;
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
        modelName: 'Presentation',
        tableName: 'presentations',
        underscored: true,
      }
    );
  }

  static associate(models: Models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' });
    this.hasMany(models.Slide, {
      foreignKey: 'presentation_id',
      as: 'slides',
      onDelete: 'CASCADE',
    });
    this.hasMany(models.PresentationPlaceholder, {
      foreignKey: 'presentation_id',
      as: 'placeholders',
      onDelete: 'CASCADE',
    });
  }
}
