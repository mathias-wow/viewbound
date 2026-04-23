'use strict';

const { Sequelize } = require('sequelize');
const placeFactory = require('../models/Place');

let sequelize;
let Place;

beforeAll(async () => {
  sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
  Place = placeFactory(sequelize);
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

const VALID_PLACE = {
  name: 'Kyoto Imperial Palace',
  editorial_narrative:
    'A serene sanctuary in the heart of Kyoto, where centuries of imperial history breathe through ancient gardens and ceremonial halls.',
  hero_image_high_res: 'https://cdn.viewbound.com/places/kyoto-palace/hero.jpg',
  gallery_assets: [
    'https://cdn.viewbound.com/places/kyoto-palace/gallery-1.jpg',
    'https://cdn.viewbound.com/places/kyoto-palace/gallery-2.jpg',
  ],
  author: 'Yuki Tanaka',
};

describe('Place model — happy path', () => {
  test('creates, saves, and retrieves a Place without errors', async () => {
    const place = await Place.create(VALID_PLACE);

    expect(place.id).toBeDefined();
    expect(place.name).toBe(VALID_PLACE.name);
    expect(place.editorial_narrative).toBe(VALID_PLACE.editorial_narrative);
    expect(place.hero_image_high_res).toBe(VALID_PLACE.hero_image_high_res);
    expect(place.gallery_assets).toEqual(VALID_PLACE.gallery_assets);
    expect(place.author).toBe(VALID_PLACE.author);
    expect(place.status).toBe('draft');
    expect(place.createdAt).toBeDefined();

    const fetched = await Place.findByPk(place.id);
    expect(fetched).not.toBeNull();
    expect(fetched.name).toBe(VALID_PLACE.name);
    expect(fetched.gallery_assets).toEqual(VALID_PLACE.gallery_assets);
  });

  test('defaults status to draft', async () => {
    const place = await Place.create(VALID_PLACE);
    expect(place.status).toBe('draft');
  });
});

describe('Place model — validation', () => {
  test('rejects missing editorial_narrative', async () => {
    const { editorial_narrative, ...data } = VALID_PLACE;
    await expect(Place.create(data)).rejects.toThrow();
  });

  test('rejects empty editorial_narrative', async () => {
    await expect(Place.create({ ...VALID_PLACE, editorial_narrative: '' })).rejects.toThrow();
  });

  test('rejects missing hero_image_high_res', async () => {
    const { hero_image_high_res, ...data } = VALID_PLACE;
    await expect(Place.create(data)).rejects.toThrow();
  });

  test('rejects invalid hero_image_high_res URL', async () => {
    await expect(
      Place.create({ ...VALID_PLACE, hero_image_high_res: 'not-a-url' })
    ).rejects.toThrow();
  });

  test('rejects empty gallery_assets array', async () => {
    await expect(
      Place.create({ ...VALID_PLACE, gallery_assets: [] })
    ).rejects.toThrow();
  });

  test('rejects gallery_assets with an invalid URL', async () => {
    await expect(
      Place.create({ ...VALID_PLACE, gallery_assets: ['not-a-url'] })
    ).rejects.toThrow();
  });

  test('rejects missing author', async () => {
    const { author, ...data } = VALID_PLACE;
    await expect(Place.create(data)).rejects.toThrow();
  });

  test('rejects invalid status value', async () => {
    await expect(
      Place.create({ ...VALID_PLACE, status: 'invalid-status' })
    ).rejects.toThrow();
  });

  test('accepts valid status transitions', async () => {
    for (const status of ['draft', 'review', 'published']) {
      const place = await Place.create({ ...VALID_PLACE, status });
      expect(place.status).toBe(status);
    }
  });
});
