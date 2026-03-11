'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('slides', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      presentation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'presentations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      template_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'slide_templates',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      background_color: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '#ffffff',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('slides', ['presentation_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('slides', ['presentation_id']);
    await queryInterface.dropTable('slides');
  },
};
