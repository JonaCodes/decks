import { Model, DataTypes, Sequelize } from 'sequelize';
import { Models } from './index';

export default class PresentationPlaceholder extends Model {
  public id!: number;
  public presentationId!: number;
  public placeholderKey!: string;
  public imageSrc!: string;
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
        placeholderKey: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        imageSrc: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'PresentationPlaceholder',
        tableName: 'presentation_placeholders',
        underscored: true,
      }
    );
  }

  static associate(models: Models) {
    this.belongsTo(models.Presentation, { foreignKey: 'presentation_id' });
  }
}
