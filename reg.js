const execSync = require('child_process').execSync;
const fs = require('fs');

const path = './results/after';

try {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
  //reg
  execSync('node ./node_modules/reg-cli/dist/cli.js ./results/development/ ./results/production/ ./results/diff/ -R ./results/report.html');
} catch (err) {
  err.stdout;
  err.stderr;
  err.pid;
  err.signal;
  err.status;
}
