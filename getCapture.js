const puppeteer = require('puppeteer');

process.on('exit', function() {
  console.log('child exit');
});

//process.on('message', async function({ url, output }, processExit = false) {
process.on('message', async function(data) {
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
  const processExit = data.processExit;

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
    const viewportHeight = 1200;
    const viewportWidth = 1200;
    const browser = await puppeteer.launch({
      headless: true
    });

    const page = await browser.newPage();
    page.setViewport({
      width: viewportWidth,
      height: viewportHeight
    });

    await page.goto(url);

    // 1
    await page
      .waitForNavigation({
        waitUntil: 'networkidle0',
        timeout: 0
      })
      .catch(e => {
        // console.log('timeout exceed. proceed to next operation'));
      });

    await scrollToBottom(page, viewportHeight);

    await page
      .waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 0
      })
      .catch(e => {
        // console.log('timeout exceed. proceed to next operation');
      });

    await page.screenshot({
      path: output,
      fullPage: true
    });

    console.log('save screenshot: ' + url);
    await browser.close();
  }

  console.log('start screenshot: ' + url);
  console.log(data.query);

  await getCapture();

  if (!processExit) {
    process.send({
      message: 'fix',
      threadNumber: threadNumber
    });
  } else {
    process.send({
      message: 'exit',
      threadNumber: threadNumber
    });
    process.exit();
  }
});
