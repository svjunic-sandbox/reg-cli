const puppeteer = require('puppeteer');
const getCapture = require('./getCapture.js');

const execSync = require('child_process').execSync;

const fs = require('fs');

const { PASH_LIST, HOSTS } = require('./config.js');

const dirlist = [
  './results/production',
  './results/development',
  './results/cli',
  './results/diff'
];

dirlist.forEach(path => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
});

let cliargv = [...process.argv];
cliargv.shift(); // node
cliargv.shift(); // runnnig script path

if (cliargv && cliargv.length > 0) {
  urlLists.forEach(url => {
    getCapture({
      url: url,
      output: `cli/${url.replace(/:/g, '').replace(/\//g, '_')}.png`
    });
  });
} else {
  PASH_LIST.forEach(async url => {
    console.log(url);
    try {
      const promises = [];

      promises.push(
        getCapture({
          url: `${HOSTS.production}${url}`,
          output: `results/production/${url
            .replace(/:/g, '')
            .replace(/\/$/g, '_index.html')
            .replace(/\//g, '_')}.png`
        })
      );

      promises.push(
        getCapture({
          url: `${HOSTS.development}${url}`,
          output: `results/development/${url
            .replace(/:/g, '')
            .replace(/\/$/g, '_index.html')
            .replace(/\//g, '_')}.png`
        })
      );

      await Promise.all(promises);

      //reg
      execSync(
        'node ./node_modules/reg-cli/dist/cli.js ./results/development/ ./results/production/ ./results/diff/ -R ./results/report.html'
      );
    } catch (err) {
      err.stdout;
      err.stderr;
      err.pid;
      err.signal;
      err.status;
    }
  });
}
