const { Model } = require('sequelize');

const URL_PATTERN = /^https?:\/\/.+/;

function validateCdnUrl(value, fieldName) {
  if (!URL_PATTERN.test(value)) {
    throw new Error(`${fieldName} must be a valid http(s) URL`);
  }
}

module.exports = (sequelize, DataTypes) => {
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
          notNull: { msg: 'Place name is required' },
          notEmpty: { msg: 'Place name cannot be empty' },
        },
      },
      editorial_narrative: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: 'editorial_narrative is required' },
          notEmpty: { msg: 'editorial_narrative cannot be empty' },
        },
      },
      hero_image_high_res: {
        type: DataTypes.STRING(2048),
        allowNull: false,
        validate: {
          notNull: { msg: 'hero_image_high_res is required' },
          isValidUrl(value) {
            validateCdnUrl(value, 'hero_image_high_res');
          },
        },
      },
      gallery_assets: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          notNull: { msg: 'gallery_assets is required' },
          isValidGallery(value) {
            if (!Array.isArray(value)) {
              throw new Error('gallery_assets must be an array');
            }
            if (value.length < 1) {
              throw new Error('gallery_assets must contain at least one asset');
            }
            for (const url of value) {
              validateCdnUrl(url, 'gallery_assets item');
            }
          },
        },
      },
      // Every place must be attributable to a human — no anonymous listings.
      // Stored as a display string until the users/guides model exists; a FK migration
      // will be added when that table is created.
      attributed_to: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'attributed_to is required — every place must be attributable to a human' },
          notEmpty: { msg: 'attributed_to cannot be empty' },
        },
      },
      latitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
        validate: {
          notNull: { msg: 'latitude is required' },
          min: { args: [-90], msg: 'latitude must be >= -90' },
          max: { args: [90], msg: 'latitude must be <= 90' },
        },
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
        validate: {
          notNull: { msg: 'longitude is required' },
          min: { args: [-180], msg: 'longitude must be >= -180' },
          max: { args: [180], msg: 'longitude must be <= 180' },
        },
      },
      // Supports the 18-month verification rule: places are never published unverified.
      last_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('draft', 'review', 'published'),
        defaultValue: 'draft',
        allowNull: false,
        validate: {
          isIn: {
            args: [['draft', 'review', 'published']],
            msg: 'status must be one of: draft, review, published',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Place',
      tableName: 'places',
      timestamps: true,
    }
  );

  return Place;
};
