'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('presentation_placeholders', {
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
      placeholder_key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image_src: {
        type: Sequelize.TEXT,
        allowNull: false,
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

    await queryInterface.addConstraint('presentation_placeholders', {
      fields: ['presentation_id', 'placeholder_key'],
      type: 'unique',
      name: 'presentation_placeholders_presentation_id_placeholder_key_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('presentation_placeholders');
  },
};
