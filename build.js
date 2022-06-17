const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  const files = [
    './dist/polyfills.js',
    './dist/main.js'
  ];

  await concat(files, './dist/webcomp-ecar-friendly-accommodations.min.js');
  await fs.remove('./dist/polyfills.js')
  await fs.remove('./dist/main.js')
})();