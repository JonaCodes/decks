import { Model, DataTypes, Sequelize } from 'sequelize';

export default class LlmBatchTask extends Model {
  public id!: number;
  public batchId!: string;
  public customId!: string;
  public model!: string;
  public taskName!: string;
  public status!:
    | 'validating'
    | 'failed'
    | 'in_progress'
    | 'finalizing'
    | 'completed'
    | 'expired'
    | 'cancelling'
    | 'cancelled';

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
        batchId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        taskName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        customId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        model: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM(
            'validating',
            'failed',
            'in_progress',
            'finalizing',
            'completed',
            'expired',
            'cancelling',
            'cancelled'
          ),
          allowNull: false,
          defaultValue: 'validating',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: 'LlmBatchTask',
        tableName: 'llm_batch_tasks',
        underscored: true,
      }
    );
  }

  static associate(_: any) {
    // No associations needed for now
  }
}
