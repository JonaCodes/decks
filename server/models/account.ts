import { Model, DataTypes, Sequelize } from 'sequelize';
import { Models } from './index';

export default class Account extends Model {
  public id!: number;
  public name!: string;
  public primaryContactEmail!: string;
  public provider!: string;
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
          allowNull: true,
        },
        primaryContactEmail: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        provider: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Account',
        tableName: 'accounts',
        underscored: true,
      }
    );
  }

  static associate(models: Models) {
    this.hasMany(models.User, { foreignKey: 'account_id' });
  }
}
