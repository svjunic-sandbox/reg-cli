const puppeteer = require('puppeteer');
const getCapture = require('./getCapture.js');

const execSync = require('child_process').execSync;

const fs = require('fs');

const { PATH_LIST, HOSTS } = require('./config.js');

const dirlist = ['./results/production', './results/development', './results/cli', './results/diff'];

for (let i = 0; i < dirlist.length; ++i) {
  let path = dirlist[i];
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}

let cliargv = [...process.argv];
cliargv.shift(); // node
cliargv.shift(); // runnnig script path

if (cliargv && cliargv.length > 0) {
  exec_capturing_cli();
} else {
  exec_capturing_reg();
}

async function exec_capturing_cli(url) {
  for (let i = 0; i < urlLists.length; ++i) {
    let url = urlLists[i];
    getCapture({
      url: url,
      output: `results/cli/${url
        .replace(/^_/g, '')
        .replace(/:/g, '')
        .replace(/\/$/g, '_index.html')
        .replace(/\//g, '_')}.png`
    });
  }
}
async function exec_capturing_reg() {
  for (let i = 0; i < PATH_LIST.length; ++i) {
    let promises = [];

    let url = PATH_LIST[i];
    console.log(url);

    promises.push(
      getCapture({
        url: `${HOSTS.production}${url}`,
        output: `results/production/${url
          .replace(/^_/g, '')
          .replace(/:/g, '')
          .replace(/\/$/g, '_index.html')
          .replace(/\//g, '_')}.png`
      })
    );

    promises.push(
      getCapture({
        url: `${HOSTS.development}${url}`,
        output: `results/development/${url
          .replace(/^_/g, '')
          .replace(/:/g, '')
          .replace(/\/$/g, '_index.html')
          .replace(/\//g, '_')}.png`
      })
    );

    await Promise.all(promises);
  }

  try {
    //reg
    execSync('node ./node_modules/reg-cli/dist/cli.js ./results/development/ ./results/production/ ./results/diff/ -R ./results/report.html');
  } catch (err) {
    err.stdout;
    err.stderr;
    err.pid;
    err.signal;
    err.status;
  }
}
