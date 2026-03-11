'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('slide_elements', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      slide_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'slides',
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
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM(
          'text',
          'split_color_text',
          'shape',
          'image',
          'placeholder_image'
        ),
        allowNull: false,
      },
      x: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      y: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      width: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      height: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      rotation: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      reveal_order: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      properties: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      z_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.sequelize.query(
      `ALTER TABLE slide_elements ADD CONSTRAINT slide_elements_exactly_one_parent
       CHECK (num_nonnulls(slide_id, template_id) = 1)`
    );

    await queryInterface.addIndex('slide_elements', ['slide_id']);
    await queryInterface.addIndex('slide_elements', ['template_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('slide_elements', ['slide_id']);
    await queryInterface.removeIndex('slide_elements', ['template_id']);
    await queryInterface.sequelize.query(
      `ALTER TABLE slide_elements DROP CONSTRAINT IF EXISTS slide_elements_exactly_one_parent`
    );
    await queryInterface.dropTable('slide_elements');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_slide_elements_type";'
    );
  },
};
