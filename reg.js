const execSync = require('child_process').execSync;
const fs = require('fs');

const dirlist = [];
dirlist.push('./results/pc/diff/');
dirlist.push('./results/sp/diff/');
dirlist.push('./results/mb/diff/');

try {
  for (let i = 0; i < dirlist.length; ++i) {
    let path = dirlist[i];
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  }
  //reg
  execSync('node ./node_modules/reg-cli/dist/cli.js ./results/pc/before/ ./results/pc/after/ ./results/pc/diff/ -R ./results/pc/report.html');
} catch (err) {
  err.stdout;
  err.stderr;
  err.pid;
  err.signal;
  err.status;
}

try {
  for (let i = 0; i < dirlist.length; ++i) {
    let path = dirlist[i];
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  }
  //reg
  execSync('node ./node_modules/reg-cli/dist/cli.js ./results/sp/before/ ./results/sp/after/ ./results/sp/diff/ -R ./results/sp/report.html');
} catch (err) {
  err.stdout;
  err.stderr;
  err.pid;
  err.signal;
  err.status;
}

try {
  for (let i = 0; i < dirlist.length; ++i) {
    let path = dirlist[i];
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  }
  //reg
  execSync('node ./node_modules/reg-cli/dist/cli.js ./results/mb/before/ ./results/mb/after/ ./results/mb/diff/ -R ./results/mb/report.html');
} catch (err) {
  err.stdout;
  err.stderr;
  err.pid;
  err.signal;
  err.status;
}
