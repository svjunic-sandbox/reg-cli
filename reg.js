const execSync = require('child_process').execSync;
const fs = require('fs');

const path = './results/after';

try {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
  //reg
  execSync('node ./node_modules/reg-cli/dist/cli.js ./results/pc/before/ ./results/pc/after/ ./results/pc/diff/ -R ./results/pc/report.html');
  execSync('node ./node_modules/reg-cli/dist/cli.js ./results/sp/before/ ./results/sp/after/ ./results/sp/diff/ -R ./results/sp/report.html');
  execSync('node ./node_modules/reg-cli/dist/cli.js ./results/mb/before/ ./results/mb/after/ ./results/mb/diff/ -R ./results/mb/report.html');
} catch (err) {
  err.stdout;
  err.stderr;
  err.pid;
  err.signal;
  err.status;
}
