import puppeteer from 'puppeteer';

const iPhone = puppeteer.devices['iPhone 6'];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.emulate(iPhone);
  const response = await page.goto('https://www.google.com');

  console.log(response.headers());

  // other actions...
  await browser.close();
})();
