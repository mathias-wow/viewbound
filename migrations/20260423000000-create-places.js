'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('places', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
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
      // Array of CDN asset URLs; stored as JSON for cross-database compatibility.
      // In production PostgreSQL, consider migrating to JSONB for indexed queries.
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
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true,
      },
      // draft | review | published
      status: {
        type: Sequelize.STRING,
        defaultValue: 'draft',
        allowNull: false,
      },
      last_verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('places');
  },
};
