import { Model, DataTypes, Sequelize } from 'sequelize';
import { Models } from './index';

export default class User extends Model {
  public id!: number;
  public supabaseId!: string;
  public email!: string;
  public fullName!: string | null;
  public avatarUrl!: string | null;
  public provider!: string | null;
  public lastLogin!: Date | null;
  public accountId!: number | null;
  public extraData!: Record<string, unknown> | null;
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
        supabaseId: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        fullName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        avatarUrl: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        provider: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        lastLogin: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        accountId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'accounts',
            key: 'id',
          },
        },
        extraData: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        underscored: true,
      }
    );
  }

  static associate(models: Models) {
    this.belongsTo(models.Account, { foreignKey: 'account_id' });
    this.hasMany(models.Event, { foreignKey: 'user_id' });
    this.hasMany(models.LlmTokenUsage, { foreignKey: 'user_id' });
    this.hasMany(models.Presentation, { foreignKey: 'user_id' });
    this.hasMany(models.SlideTemplate, { foreignKey: 'user_id' });
  }
}
