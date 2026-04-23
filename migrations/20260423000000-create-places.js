'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('places', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      editorial_narrative: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      hero_image_high_res: {
        type: Sequelize.STRING(2048),
        allowNull: false,
      },
      gallery_assets: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      attributed_to: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('draft', 'review', 'published'),
        defaultValue: 'draft',
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('places');
  },
};
