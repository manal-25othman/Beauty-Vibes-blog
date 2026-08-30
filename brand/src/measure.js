/**
 * Print the ink bounds of the <g id="m"> group in an SVG file, as JSON.
 * Used by fit.py to size a canvas around artwork whose extent is hard to
 * compute by hand.  Usage: node measure.js file.svg
 */
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const svg = fs.readFileSync(process.argv[2], 'utf8');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(svg);
  const box = await page.evaluate(() => {
    const { x, y, width, height } = document.getElementById('m').getBBox();
    return { x, y, w: width, h: height };
  });
  console.log(JSON.stringify(box));
  await browser.close();
})();
