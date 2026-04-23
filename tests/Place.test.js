const { sequelize, Place } = require('../models');

const VALID = {
  name: 'Yoyogi Park',
  editorial_narrative:
    'A vast green sanctuary in the heart of Tokyo, beloved by locals for morning tai chi and weekend picnics. In spring, cherry blossoms transform the main avenue into a pink cathedral.',
  hero_image_high_res: 'https://cdn.viewbound.com/assets/yoyogi-park-hero.jpg',
  gallery_assets: [
    'https://cdn.viewbound.com/assets/yoyogi-1.jpg',
    'https://cdn.viewbound.com/assets/yoyogi-2.jpg',
  ],
  attributed_to: 'Kenji Watanabe, Local Guide',
  last_verified_at: new Date('2026-01-15'),
};

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Place model — happy path', () => {
  test('creates, saves, and retrieves a Place', async () => {
    const place = await Place.create(VALID);

    expect(place.id).toBeDefined();
    expect(place.name).toBe(VALID.name);
    expect(place.editorial_narrative).toBe(VALID.editorial_narrative);
    expect(place.hero_image_high_res).toBe(VALID.hero_image_high_res);
    expect(place.gallery_assets).toEqual(VALID.gallery_assets);
    expect(place.attributed_to).toBe(VALID.attributed_to);
    expect(place.status).toBe('draft');

    const found = await Place.findByPk(place.id);
    expect(found).not.toBeNull();
    expect(found.name).toBe(VALID.name);
    expect(found.gallery_assets).toEqual(VALID.gallery_assets);
  });

  test('status defaults to draft', async () => {
    const place = await Place.create(VALID);
    expect(place.status).toBe('draft');
  });

  test('accepts review and published status', async () => {
    const review = await Place.create({ ...VALID, status: 'review' });
    expect(review.status).toBe('review');

    const published = await Place.create({ ...VALID, status: 'published' });
    expect(published.status).toBe('published');
  });
});

describe('Place model — validation', () => {
  test('rejects null editorial_narrative', async () => {
    await expect(Place.create({ ...VALID, editorial_narrative: null })).rejects.toThrow();
  });

  test('rejects empty editorial_narrative', async () => {
    await expect(Place.create({ ...VALID, editorial_narrative: '' })).rejects.toThrow();
  });

  test('rejects null hero_image_high_res', async () => {
    await expect(Place.create({ ...VALID, hero_image_high_res: null })).rejects.toThrow();
  });

  test('rejects non-URL hero_image_high_res', async () => {
    await expect(Place.create({ ...VALID, hero_image_high_res: 'not-a-url' })).rejects.toThrow();
  });

  test('rejects empty gallery_assets array', async () => {
    await expect(Place.create({ ...VALID, gallery_assets: [] })).rejects.toThrow();
  });

  test('rejects non-array gallery_assets', async () => {
    await expect(Place.create({ ...VALID, gallery_assets: 'https://cdn.viewbound.com/img.jpg' })).rejects.toThrow();
  });

  test('rejects invalid URL in gallery_assets', async () => {
    await expect(Place.create({ ...VALID, gallery_assets: ['not-a-url'] })).rejects.toThrow();
  });

  test('rejects null attributed_to', async () => {
    await expect(Place.create({ ...VALID, attributed_to: null })).rejects.toThrow();
  });

  test('rejects empty attributed_to', async () => {
    await expect(Place.create({ ...VALID, attributed_to: '' })).rejects.toThrow();
  });
});
