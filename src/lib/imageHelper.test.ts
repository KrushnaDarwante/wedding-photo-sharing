import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeImageUrl,
  getPhotoThumbnailUrl,
  getPhotoOriginalUrl,
  FALLBACK_IMAGE_DATA_URI
} from './imageHelper';
import { WeddingPhoto } from '../types';

test('normalizeImageUrl handles null, empty, and undefined safely', () => {
  assert.equal(normalizeImageUrl(null), FALLBACK_IMAGE_DATA_URI);
  assert.equal(normalizeImageUrl(undefined), FALLBACK_IMAGE_DATA_URI);
  assert.equal(normalizeImageUrl(''), FALLBACK_IMAGE_DATA_URI);
  assert.equal(normalizeImageUrl('   '), FALLBACK_IMAGE_DATA_URI);
});

test('normalizeImageUrl rewrites legacy /src/assets/images paths to public /assets/images', () => {
  const legacy = '/src/assets/images/hero_wedding_couple_1793789594998.jpg';
  const expected = '/assets/images/hero_wedding_couple_1793789594998.jpg';
  assert.equal(normalizeImageUrl(legacy), expected);

  const relative = 'src/assets/images/sample_wedding_haldi_1793789596208.jpg';
  const expectedRelative = '/assets/images/sample_wedding_haldi_1793789596208.jpg';
  assert.equal(normalizeImageUrl(relative), expectedRelative);
});

test('normalizeImageUrl preserves valid public, http, data, and blob URLs', () => {
  const publicPath = '/assets/images/hero_wedding_couple_thumb.webp';
  assert.equal(normalizeImageUrl(publicPath), publicPath);

  const httpsUrl = 'https://cdn.aurawed.com/photos/wedding_1.webp';
  assert.equal(normalizeImageUrl(httpsUrl), httpsUrl);

  const blobUrl = 'blob:http://localhost:3000/1234-5678';
  assert.equal(normalizeImageUrl(blobUrl), blobUrl);

  const dataUri = 'data:image/webp;base64,AAAA';
  assert.equal(normalizeImageUrl(dataUri), dataUri);
});

test('getPhotoThumbnailUrl and getPhotoOriginalUrl resolve appropriate URLs', () => {
  const samplePhoto: WeddingPhoto = {
    id: 'p1',
    eventId: 'e1',
    photographerId: 'stud1',
    originalUrl: '/src/assets/images/hero_wedding_couple_1793789594998.jpg',
    thumbnailUrl: '/src/assets/images/hero_wedding_couple_thumb.webp',
    filename: 'hero.jpg',
    fileSizeBytes: 1000,
    width: 1200,
    height: 800,
    category: 'Portraits',
    viewsCount: 0,
    downloadsCount: 0,
    createdAt: new Date().toISOString(),
    uploadedAt: new Date().toISOString()
  };

  assert.equal(
    getPhotoThumbnailUrl(samplePhoto),
    '/assets/images/hero_wedding_couple_thumb.webp'
  );

  assert.equal(
    getPhotoOriginalUrl(samplePhoto),
    '/assets/images/hero_wedding_couple_1793789594998.jpg'
  );
});
