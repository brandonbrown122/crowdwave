const { chromium } = require('./node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const htmlPath = path.resolve('C:/Users/brand/clawd-crowdwave/CROWDWAVE_DECK_V10.html');
  await page.goto('file://' + htmlPath);
  
  await page.pdf({
    path: 'C:/Users/brand/clawd-crowdwave/CROWDWAVE_DECK_V10.pdf',
    width: '1280px',
    height: '720px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  
  await browser.close();
  console.log('PDF created: CROWDWAVE_DECK_V9.pdf');
})();
