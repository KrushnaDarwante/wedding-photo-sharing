import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBytes,
  generateSlug,
  validatePhotoFile,
  calculateDuplicateKey,
  isGuestAllowedToUpload,
  isPhotographerAuthorized,
  filterPhotos
} from './pureLogic.ts';

test('formatBytes handles zero and standard binary prefixes correctly', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(5 * 1024 * 1024), '5 MB');
  assert.equal(formatBytes(2.5 * 1024 * 1024 * 1024), '2.5 GB');
});

test('generateSlug transforms couple names into URL safe slugs', () => {
  assert.equal(generateSlug('Aarav & Maya'), 'aarav-and-maya');
  assert.equal(generateSlug('Elena & Christian', '2026-11-20'), 'elena-and-christian-20261120');
  assert.equal(generateSlug('Sophia   and   Lucas!!!'), 'sophia-and-lucas');
});

test('validatePhotoFile enforces allowed mime types and size ceiling', () => {
  const validJpeg = { name: 'wedding_1.jpg', type: 'image/jpeg', size: 10 * 1024 * 1024 };
  assert.equal(validatePhotoFile(validJpeg).valid, true);

  const validPng = { name: 'portrait.png', type: 'image/png', size: 2 * 1024 * 1024 };
  assert.equal(validatePhotoFile(validPng).valid, true);

  const invalidPdf = { name: 'contract.pdf', type: 'application/pdf', size: 1024 };
  const invalidResult = validatePhotoFile(invalidPdf);
  assert.equal(invalidResult.valid, false);
  assert.match(invalidResult.error || '', /Unsupported file type/);

  const oversized = { name: 'huge_raw.jpg', type: 'image/jpeg', size: 65 * 1024 * 1024 };
  const oversizedResult = validatePhotoFile(oversized);
  assert.equal(oversizedResult.valid, false);
  assert.match(oversizedResult.error || '', /exceeds the 50MB limit/);

  const empty = { name: 'zero.jpg', type: 'image/jpeg', size: 0 };
  assert.equal(validatePhotoFile(empty).valid, false);
});

test('calculateDuplicateKey reliably hashes file signature for upload queues', () => {
  const key1 = calculateDuplicateKey('IMG_001.JPG', 4500000, 1793780000);
  const key2 = calculateDuplicateKey('img_001.jpg', 4500000, 1793780000);
  const key3 = calculateDuplicateKey('img_002.jpg', 4500000, 1793780000);

  assert.equal(key1, key2);
  assert.notEqual(key1, key3);
});

test('isGuestAllowedToUpload strictly enforces business rule: guests NEVER upload', () => {
  assert.equal(isGuestAllowedToUpload(), false);
});

test('isPhotographerAuthorized verifies event ownership correctly', () => {
  assert.equal(isPhotographerAuthorized('user_123', 'user_123'), true);
  assert.equal(isPhotographerAuthorized('user_999', 'user_123'), false);
  assert.equal(isPhotographerAuthorized(null, 'user_123'), false);
  assert.equal(isPhotographerAuthorized(undefined, 'user_123'), false);
});

test('filterPhotos filters by category, keyword search and favorites', () => {
  const mockPhotos = [
    { id: 'p1', category: 'haldi', caption: 'Smiling with flowers', filename: 'haldi_01.jpg' },
    { id: 'p2', category: 'reception', caption: 'First dance under lights', filename: 'dance_02.jpg' },
    { id: 'p3', category: 'sangeet', caption: 'Musical performance', filename: 'sangeet_03.jpg' },
    { id: 'p4', category: 'haldi', caption: 'Golden family portrait', filename: 'haldi_04.jpg' }
  ];

  // Category filter
  const haldiOnly = filterPhotos(mockPhotos, { selectedCategory: 'haldi' });
  assert.equal(haldiOnly.length, 2);
  assert.deepEqual(haldiOnly.map(p => p.id), ['p1', 'p4']);

  // Search keyword filter
  const danceSearch = filterPhotos(mockPhotos, { searchQuery: 'dance' });
  assert.equal(danceSearch.length, 1);
  assert.equal(danceSearch[0].id, 'p2');

  // Favorites filter
  const favs = new Set(['p2', 'p3']);
  const favsOnly = filterPhotos(mockPhotos, { onlyFavorites: true, favoriteIds: favs });
  assert.equal(favsOnly.length, 2);
  assert.deepEqual(favsOnly.map(p => p.id), ['p2', 'p3']);

  // Combined category + search
  const combined = filterPhotos(mockPhotos, { selectedCategory: 'haldi', searchQuery: 'family' });
  assert.equal(combined.length, 1);
  assert.equal(combined[0].id, 'p4');
});
