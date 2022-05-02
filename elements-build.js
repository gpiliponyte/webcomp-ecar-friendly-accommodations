const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  const files = [
    './dist/accommodation-finder/runtime.js',
    './dist/accommodation-finder/polyfills.js',
    './dist/accommodation-finder/main.js'
  ];

  await fs.ensureDir('elements');
  await concat(files, 'elements/hotel-element.js');
  await fs.copyFile(
    './dist/accommodation-finder/styles.css',
    'elements/styles.css'
  );
})();