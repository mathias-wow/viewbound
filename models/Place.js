'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Place extends Model {}

  Place.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'name cannot be empty' },
        },
      },
      editorial_narrative: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'editorial_narrative cannot be empty' },
        },
      },
      hero_image_high_res: {
        type: DataTypes.STRING(2048),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'hero_image_high_res cannot be empty' },
          isUrl: { msg: 'hero_image_high_res must be a valid URL' },
        },
      },
      gallery_assets: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          isValidGallery(value) {
            if (!Array.isArray(value) || value.length < 1) {
              throw new Error('gallery_assets must be a non-empty array of CDN URLs');
            }
            for (const item of value) {
              try {
                new URL(item);
              } catch {
                throw new Error(`gallery_assets contains an invalid URL: ${item}`);
              }
            }
          },
        },
      },
      // Every place must be attributable to a human — no anonymous listings
      attributed_to: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'attributed_to cannot be empty — every place must have a human attribution' },
        },
      },
      latitude: {
        type: DataTypes.DECIMAL(8, 6),
        allowNull: true,
        validate: {
          min: { args: [-90], msg: 'latitude must be >= -90' },
          max: { args: [90], msg: 'latitude must be <= 90' },
        },
      },
      longitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: true,
        validate: {
          min: { args: [-180], msg: 'longitude must be >= -180' },
          max: { args: [180], msg: 'longitude must be <= 180' },
        },
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'draft',
        allowNull: false,
        validate: {
          isIn: {
            args: [['draft', 'review', 'published']],
            msg: 'status must be one of: draft, review, published',
          },
        },
      },
      // Viewbound never publishes a place not verified within the last 18 months
      last_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Place',
      tableName: 'places',
      underscored: true,
    }
  );

  return Place;
};
