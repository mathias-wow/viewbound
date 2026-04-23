'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('places', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        // UUID is generated at the application layer (UUIDV4) for SQLite/PostgreSQL portability.
        // On PostgreSQL, a DB-level default can be added via: DEFAULT gen_random_uuid()
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
      latitude: {
        type: Sequelize.DECIMAL(8, 6),
        allowNull: false,
      },
      longitude: {
        type: Sequelize.DECIMAL(9, 6),
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
