const puppeteer = require('puppeteer');
const devices = puppeteer.devices;

const scrollToBottom = async (page, viewportHeight) => {
  const getScrollHeight = () => {
    return Promise.resolve(document.documentElement.scrollHeight);
  };

  let scrollHeight = await page.evaluate(getScrollHeight);
  let currentPosition = 0;
  let scrollNumber = 0;

  while (currentPosition < scrollHeight) {
    scrollNumber += 1;
    const nextPosition = scrollNumber * viewportHeight;
    await page.evaluate(function (scrollTo) {
      return Promise.resolve(window.scrollTo(0, scrollTo));
    }, nextPosition);

    await page
      .waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 50,
      })
      .catch((e) => {
        //console.log('timeout exceed. proceed to next operation')
      });

    currentPosition = nextPosition;
    //console.log(`scrollNumber: ${scrollNumber}`);
    //console.log(`currentPosition: ${currentPosition}`);

    // 2
    scrollHeight = await page.evaluate(getScrollHeight);
    //console.log(`ScrollHeight ${scrollHeight}`);
  }
};

const getCapture = async (page, { url, output }) => {
  const response = await page
    .goto(url, {
      waitUntil: 'networkidle0',
      timeout: 0,
      //waitUntil: 'networkidle2',
      //timeout: 30000,
      //waitUntil: 'load',
      //timeout: 0
    })
    .catch((e) => {
      // console.log('timeout exceed. proceed to next operation'));
      console.log('error goto', url);
      console.log(e);
    });

  const status = response.headers().status;
  console.log(`***** status : ${status} : ${url}`);
  if (response.headers().status === '404') {
    return;
  }

  try {
    await scrollToBottom(page, viewportHeight);
  } catch (e) {
    console.log('error', url);
  }

  await page.waitFor(1000); // ミリ秒

  await page.screenshot({
    path: output,
    fullPage: true,
  });

  //console.log('save screenshot: ' + url);
};

const initPageEmulate = async (page, { device, ua }) => {
  if (device === 'PC') {
    await page.setViewport({
      width: 1200,
      height: 1200,
      deviceScaleFactor: 1,
    });
    await page.setUserAgent(ua);
  } else if (device === 'SP') {
    await page.emulate(devices['iPhone 6']); // デバイス適用
    //await page.emulate(devices['iPhone X']); // デバイス適用
  } else if (device === 'MB') {
    await page.setViewport({
      width: 320,
      height: 300,
      deviceScaleFactor: 1,
    });
    await page.setUserAgent(ua);
  } else {
    await page.setViewport({
      width: 1200,
      height: 1200,
      deviceScaleFactor: 1,
    });
    await page.setUserAgent(ua);
  }
};

const capture = async ({ page, data }) => {
  await initPageEmulate(page, data);
  await getCapture(page, data);
};

module.exports = capture;
//export default capture;
