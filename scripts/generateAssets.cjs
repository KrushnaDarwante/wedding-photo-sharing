const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processImages() {
  const imagesDir = path.join(__dirname, '..', 'public', 'assets', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const baseCouple = path.join(imagesDir, 'hero_wedding_couple_1793789594998.jpg');
  const baseTable = path.join(imagesDir, 'wedding_reception_table_1793789596043.jpg');
  const baseHaldi = path.join(imagesDir, 'sample_wedding_haldi_1793789596208.jpg');
  const baseAvatar = path.join(imagesDir, 'photographer_avatar_1793789596829.jpg');

  // Base thumbnails
  await sharp(baseCouple).resize(600).webp({ quality: 80 }).toFile(path.join(imagesDir, 'hero_wedding_couple_thumb.webp'));
  await sharp(baseCouple).resize(600).jpeg({ quality: 80 }).toFile(path.join(imagesDir, 'hero_wedding_couple_thumb.jpg'));
  
  await sharp(baseTable).resize(600).webp({ quality: 80 }).toFile(path.join(imagesDir, 'wedding_reception_table_thumb.webp'));
  await sharp(baseTable).resize(600).jpeg({ quality: 80 }).toFile(path.join(imagesDir, 'wedding_reception_table_thumb.jpg'));

  await sharp(baseHaldi).resize(600).webp({ quality: 80 }).toFile(path.join(imagesDir, 'sample_wedding_haldi_thumb.webp'));
  await sharp(baseHaldi).resize(600).jpeg({ quality: 80 }).toFile(path.join(imagesDir, 'sample_wedding_haldi_thumb.jpg'));

  await sharp(baseAvatar).resize(200, 200).webp({ quality: 85 }).toFile(path.join(imagesDir, 'photographer_avatar_thumb.webp'));
  await sharp(baseAvatar).resize(200, 200).jpeg({ quality: 85 }).toFile(path.join(imagesDir, 'photographer_avatar_thumb.jpg'));

  // Elena & Christian Gallery - 4 distinct categories with dedicated images:
  // 1. Portraits: Sunset rose garden (original couple)
  // 2. Ceremony: Vows under archway (intimate close crop with warm grading)
  await sharp(baseCouple)
    .extract({ left: 150, top: 40, width: 850, height: 650 })
    .modulate({ brightness: 1.05, saturation: 1.1 })
    .jpeg({ quality: 90 })
    .toFile(path.join(imagesDir, 'elena_christian_vows_ceremony.jpg'));

  await sharp(path.join(imagesDir, 'elena_christian_vows_ceremony.jpg'))
    .resize(600)
    .webp({ quality: 80 })
    .toFile(path.join(imagesDir, 'elena_christian_vows_ceremony_thumb.webp'));

  // 3. Reception: Candlelit table (original table)
  // 4. Cocktail: Evening lights & toasts (ambiance crop with warm twilight tone)
  await sharp(baseTable)
    .extract({ left: 100, top: 80, width: 900, height: 680 })
    .modulate({ brightness: 0.98, saturation: 1.15 })
    .jpeg({ quality: 90 })
    .toFile(path.join(imagesDir, 'elena_christian_cocktail_hour.jpg'));

  await sharp(path.join(imagesDir, 'elena_christian_cocktail_hour.jpg'))
    .resize(600)
    .webp({ quality: 80 })
    .toFile(path.join(imagesDir, 'elena_christian_cocktail_hour_thumb.webp'));

  // Maya & Aarav Gallery:
  // 1. Haldi: Yellow blessings (original haldi)
  // 2. Portraits: Royal portraits (regal crop)
  await sharp(baseHaldi)
    .extract({ left: 120, top: 50, width: 850, height: 680 })
    .modulate({ brightness: 1.02, saturation: 1.2 })
    .jpeg({ quality: 90 })
    .toFile(path.join(imagesDir, 'maya_aarav_royal_portraits.jpg'));

  await sharp(path.join(imagesDir, 'maya_aarav_royal_portraits.jpg'))
    .resize(600)
    .webp({ quality: 80 })
    .toFile(path.join(imagesDir, 'maya_aarav_royal_portraits_thumb.webp'));

  // 3. Sangeet: Dance & celebrations (dramatic festival tone)
  await sharp(baseHaldi)
    .extract({ left: 200, top: 100, width: 800, height: 640 })
    .modulate({ brightness: 1.08, saturation: 1.25 })
    .jpeg({ quality: 90 })
    .toFile(path.join(imagesDir, 'maya_aarav_sangeet_dance.jpg'));

  await sharp(path.join(imagesDir, 'maya_aarav_sangeet_dance.jpg'))
    .resize(600)
    .webp({ quality: 80 })
    .toFile(path.join(imagesDir, 'maya_aarav_sangeet_dance_thumb.webp'));

  // Also sync to src/assets/images and public/src/assets/images for full compatibility
  const srcImagesDir = path.join(__dirname, '..', 'src', 'assets', 'images');
  const pubSrcImagesDir = path.join(__dirname, '..', 'public', 'src', 'assets', 'images');
  
  if (!fs.existsSync(srcImagesDir)) fs.mkdirSync(srcImagesDir, { recursive: true });
  if (!fs.existsSync(pubSrcImagesDir)) fs.mkdirSync(pubSrcImagesDir, { recursive: true });

  const allGenerated = fs.readdirSync(imagesDir);
  for (const f of allGenerated) {
    fs.copyFileSync(path.join(imagesDir, f), path.join(srcImagesDir, f));
    fs.copyFileSync(path.join(imagesDir, f), path.join(pubSrcImagesDir, f));
  }

  console.log('Successfully generated and synced all optimized wedding image assets!');
}

processImages().catch(err => {
  console.error('Error generating image assets:', err);
  process.exit(1);
});
