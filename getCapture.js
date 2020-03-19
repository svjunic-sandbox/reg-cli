const puppeteer = require('puppeteer');

let page, browser;
const viewportHeight = 1200;
const viewportWidth = 1200;

async function setup(data) {
  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      '--single-process',
      '--incognito'
    ]
  });

  page = await browser.newPage();

  // TODO: あとでデバイス振り分けができるようにする
  //let pc = true;
  let pc = false;

  if (pc) {
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
    );

    await page.setViewport({
      width: viewportWidth,
      height: viewportHeight
    });
  } else {
    // 選択するパターン
    const devices = require('puppeteer/DeviceDescriptors');
    await page.emulate(devices['iPhone X']);
  }
}

async function capture(data) {
  const threadNumber = data.threadNumber;

  if (data.query === undefined) {
    process.send({
      message: 'exit',
      threadNumber: threadNumber
    });
    process.exit();
    return;
  }

  const { url, output } = data.query;

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
    await page
      .goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
        //waitUntil: 'load',
        //timeout: 0
      })
      .catch(e => {
        // console.log('timeout exceed. proceed to next operation'));
        console.log('error goto', url);
        //console.log(e);
      });

    try {
      await scrollToBottom(page, viewportHeight);
    } catch (e) {
      console.log('error', url);
    }

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

  const threadNumber = data.threadNumber;

  if (data.query === 'setup') {
    await setup(data);
    process.send({
      message: 'setup-fix',
      threadNumber: threadNumber
    });
  } else if (data.query === 'close') {
    await browser.close();
    process.send({
      message: 'close',
      threadNumber: threadNumber
    });
    process.exit();
  } else {
    await capture(data);
    if (!data.processExit) {
      process.send({
        message: 'fix',
        threadNumber: threadNumber
      });
    } else {
      await browser.close();
      process.send({
        message: 'exit',
        threadNumber: threadNumber
      });
      process.exit();
    }
  }
});
