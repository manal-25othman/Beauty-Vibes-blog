/**
 * Render the SVG logo files to PNG.
 *
 *   npm i playwright   # or use a system Chromium
 *   node export-png.js ../assets
 *
 * Each entry is [file, width in CSS px, scale factors...].
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(process.argv[2] || path.join(__dirname, '..', 'assets'));
const JOBS = [
  ['beauty-vibes-logo-horizontal.svg', 1200, [1, 2]],
  ['beauty-vibes-logo-horizontal-transparent.svg', 1200, [2]],
  ['beauty-vibes-logo-compact.svg', 720, [2]],
  ['beauty-vibes-logo-stacked.svg', 800, [2]],
  ['beauty-vibes-mark.svg', 512, [1]],
  ['beauty-vibes-badge.svg', 512, [1]],
  ['beauty-vibes-favicon.svg', 180, [1]],
];

(async () => {
  const browser = await chromium.launch();
  for (const [file, width, scales] of JOBS) {
    const svg = fs.readFileSync(path.join(DIR, file), 'utf8');
    const [, vw, vh] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    const height = Math.round((width * vh) / vw);
    for (const scale of scales) {
      const page = await browser.newPage({ deviceScaleFactor: scale });
      await page.setViewportSize({ width, height });
      await page.setContent(
        `<style>html,body{margin:0}svg{display:block;width:${width}px;height:${height}px}</style>${svg}`
      );
      const suffix = scale === 1 ? '' : `@${scale}x`;
      const out = path.join(DIR, file.replace(/\.svg$/, `${suffix}.png`));
      await page.screenshot({ path: out, omitBackground: true });
      await page.close();
      console.log('  ', path.basename(out), `${width * scale}x${height * scale}`);
    }
  }
  await browser.close();
})();
