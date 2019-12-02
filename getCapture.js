import puppeteer from 'puppeteer';
const devices = puppeteer.device;

let page, browser;

const viewportHeight = 1200;
const viewportWidth = 1200;

async function setup() {
  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      '--single-process'
    ]
  });

  page = await browser.newPage();
}

async function capture(data) {
  const threadNumber = data.threadNumber;

  if (data.query === undefined) {
    process.send({
      message: 'exit',
      threadNumber: threadNumber
    });
    process.exit();
  }

  const { url, device, ua, output } = data.query;

  if (device === 'PC') {
    await page.setViewport({
      width: 1200,
      height: 1200,
      deviceScaleFactor: 1
    });
    await page.setUserAgent(ua);
  } else if (device === 'SP') {
    await page.emulate(devices['iPhone 6']); // デバイス適用
  } else if (device === 'MB') {
    await page.setViewport({
      width: 320,
      height: 300,
      deviceScaleFactor: 1
    });
    await page.setUserAgent(ua);
  } else {
    await page.setViewport({
      width: 1200,
      height: 1200,
      deviceScaleFactor: 1
    });
    await page.setUserAgent(ua);
  }

  async function scrollToBottom(page, viewportHeight) {
    const getScrollHeight = () => {
      return Promise.resolve(document.documentElement.scrollHeight);
    };

    let scrollHeight = await page.evaluate(getScrollHeight);
    let currentPosition = 0;
    let scrollNumber = 0;

    while (currentPosition < scrollHeight) {
      scrollNumber += 1;
      const nextPosition = scrollNumber * viewportHeight;
      await page.evaluate(function(scrollTo) {
        return Promise.resolve(window.scrollTo(0, scrollTo));
      }, nextPosition);

      await page
        .waitForNavigation({
          waitUntil: 'networkidle2',
          timeout: 50
        })
        .catch(e => {
          //console.log('timeout exceed. proceed to next operation')
        });

      currentPosition = nextPosition;
      //console.log(`scrollNumber: ${scrollNumber}`);
      //console.log(`currentPosition: ${currentPosition}`);

      // 2
      scrollHeight = await page.evaluate(getScrollHeight);
      //console.log(`ScrollHeight ${scrollHeight}`);
    }
  }

  async function getCapture() {
    const response = await page
      .goto(url, {
        waitUntil: 'networkidle0',
        timeout: 0
        //waitUntil: 'networkidle2',
        //timeout: 30000
        //waitUntil: 'load',
        //timeout: 0
      })
      .catch(e => {
        // console.log('timeout exceed. proceed to next operation'));
        console.log('error goto', url);
        //console.log(e);
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

    //switch (device) {
    //  case 'PC':
    //    page.hover('.mogeta');
    //    break;
    //  case 'SP':
    //    page.tap('.mogezo');
    //    break;
    //  case 'MB':
    //    break;
    //  default:
    //    page.hover('mogeta');
    //    break;
    //}

    await page.waitFor(1000); // ミリ秒

    //await page
    //  .waitForNavigation({
    //    waitUntil: 'networkidle2',
    //    timeout: 3000
    //  })
    //  .catch(e => {
    //    // console.log('timeout exceed. proceed to next operation');
    //  });

    await page.screenshot({
      path: output,
      fullPage: true
    });

    console.log('save screenshot: ' + url);
  }

  console.log('start screenshot: ' + url);

  await getCapture();
}

process.on('exit', function() {
  console.log('child exit');
});

//process.on('message', async function({ url, output }, processExit = false) {
process.on('message', async function(data) {
  console.log(data);
  //console.log(data);

  const threadNumber = data.threadNumber;

  try {
    if (data.query === 'setup') {
      console.log('setup');
      await setup();
      process.send({
        message: 'setup-fix',
        threadNumber: threadNumber
      });
    } else if (data.query === 'close') {
      console.log('close');
      await browser.close();
      process.send({
        message: 'close',
        threadNumber: threadNumber
      });
      process.exit();
    } else {
      console.log('capture');
      await capture(data);
      if (!data.processExit) {
        process.send({
          message: 'fix',
          threadNumber: threadNumber
        });
      } else {
        console.log('exit');
        await browser.close();
        process.send({
          message: 'exit',
          threadNumber: threadNumber
        });
        process.exit();
      }
    }
  } catch (e) {
    console.log('ERROR');
    console.log(data);
    console.log(e);
    // エラーになるとpageが壊れるぽく、次のクエリでこけるので再セットアップ
    await page.close();
    await setup();
    process.send({
      message: 'error',
      threadNumber: threadNumber
    });
  }
});
