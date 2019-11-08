const execSync = require('child_process').execSync;

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
