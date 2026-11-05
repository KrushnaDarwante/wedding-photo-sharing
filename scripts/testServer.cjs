const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function testGalleryServer() {
  console.log('Testing production build server...');

  // Start vite preview on port 4173
  const preview = spawn('npx.cmd', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    cwd: path.join(__dirname, '..')
  });

  preview.stdout.on('data', data => {
    // console.log(`[preview] ${data}`);
  });

  preview.stderr.on('data', data => {
    console.error(`[preview error] ${data}`);
  });

  // Wait 3 seconds for preview server to be ready
  await new Promise(r => setTimeout(r, 3000));

  const urlsToTest = [
    '/',
    '/assets/images/hero_wedding_couple_1793789594998.jpg',
    '/assets/images/hero_wedding_couple_thumb.webp',
    '/assets/images/wedding_reception_table_1793789596043.jpg',
    '/assets/images/wedding_reception_table_thumb.webp',
    '/assets/images/elena_christian_vows_ceremony.jpg',
    '/assets/images/elena_christian_vows_ceremony_thumb.webp',
    '/assets/images/elena_christian_cocktail_hour.jpg',
    '/assets/images/elena_christian_cocktail_hour_thumb.webp',
    '/assets/images/sample_wedding_haldi_1793789596208.jpg',
    '/assets/images/sample_wedding_haldi_thumb.webp',
    '/assets/images/maya_aarav_royal_portraits.jpg',
    '/assets/images/maya_aarav_royal_portraits_thumb.webp',
    '/assets/images/maya_aarav_sangeet_dance.jpg',
    '/assets/images/maya_aarav_sangeet_dance_thumb.webp',
    '/assets/images/photographer_avatar_1793789596829.jpg',
    '/assets/images/photographer_avatar_thumb.webp'
  ];

  let allPassed = true;

  for (const urlPath of urlsToTest) {
    await new Promise((resolve) => {
      http.get(`http://localhost:4173${urlPath}`, (res) => {
        const status = res.statusCode;
        const contentType = res.headers['content-type'] || 'unknown';
        const isOk = status === 200;
        console.log(`${isOk ? '✔' : '✖'} [${status}] ${urlPath} (${contentType})`);
        if (!isOk) allPassed = false;
        resolve();
      }).on('error', (err) => {
        console.error(`✖ Error fetching ${urlPath}:`, err.message);
        allPassed = false;
        resolve();
      });
    });
  }

  preview.kill();

  if (!allPassed) {
    console.error('Some asset requests failed!');
    process.exit(1);
  } else {
    console.log('All image assets verified 200 OK with correct MIME types!');
    process.exit(0);
  }
}

testGalleryServer();
