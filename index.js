const fs = require('fs');
const puppeteer = require('puppeteer');

const { fork, execSync } = require('child_process');

//const getCapture = require('./getCapture.js');

const { PATH_LIST, UA, HOSTS } = require('./config.js');

//const dirlist = ['./results/production', './results/development', './results/cli', './results/diff'];
let ua = '';
const dirlist = [];

const VERSION = process.argv[2];
const DEVICE = process.argv[3];
const PATH_LIST_DEVICE = PATH_LIST[DEVICE];

console.log(DEVICE);
console.log(PATH_LIST_DEVICE);

switch (VERSION) {
  case 'before':
    dirlist.push('./results/pc/before/');
    dirlist.push('./results/sp/before/');
    dirlist.push('./results/mb/before/');
    break;
  case 'after':
    dirlist.push('./results/pc/after/');
    dirlist.push('./results/sp/after/');
    dirlist.push('./results/mb/after/');
    break;
  default:
    dirlist.push('./results/pc/before/');
    dirlist.push('./results/sp/before/');
    dirlist.push('./results/mb/before/');
    dirlist.push('./results/pc/after/');
    dirlist.push('./results/sp/after/');
    dirlist.push('./results/mb/after/');
    break;
}

switch (DEVICE) {
  case 'PC':
    ua = UA.PC;
    break;
  case 'SP':
    ua = UA.SP;
    break;
  case 'MB':
    ua = UA.MB;
    break;
  default:
    ua = UA.PC;
    break;
}

for (let i = 0; i < dirlist.length; ++i) {
  let path = dirlist[i];
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}

const SUBROUTINE_SCRIPT_PATH = './getCapture.js';

function createQuery() {
  const queries = [];
  for (let i = 0; i < PATH_LIST_DEVICE.length; ++i) {
    let url = PATH_LIST_DEVICE[i];

    queries.push({
      url: `${HOSTS.production}${url}`,
      ua: ua,
      output: `results/${DEVICE}/${VERSION}/${url
        .replace(/:/g, '')
        .replace(/\/$/g, '_index.html')
        .replace(/\//g, '_')
        .replace(/^_/g, '')}.png`
    });
  }

  return queries;
}

function setup(threadNumber) {
  childs[threadNumber].send({ query: 'setup', threadNumber: threadNumber });
}

function close(threadNumber) {
  childs[threadNumber].send({ query: 'close', threadNumber: threadNumber });
}

function getCapture(threadNumber) {
  const query = queries.length > 0 ? queries.shift() : undefined;
  const processExit = queries.length < childs.length;
  childs[threadNumber].send({ query: query, processExit: processExit, threadNumber: threadNumber });
}

// 他プロセスの作成
const CPUs = require('os').cpus().length;
let usingThreadNumber = CPUs;

const childs = [];
for (let i = 0; i < CPUs; ++i) {
  let child = fork(SUBROUTINE_SCRIPT_PATH);
  child.on('message', function(data) {
    if (data.message === 'exit') usingThreadNumber--;
    if (data.message === 'close') usingThreadNumber--;

    if ((data.message === 'fix' || data.message === 'setup-fix') && queries.length > 0) {
      getCapture(data.threadNumber);
    } else {
      close(data.threadNumber);
    }

    if (usingThreadNumber === 0) {
      console.log('thread exit');
      exec_reg();
      process.exit();
      return;
    }
  });
  childs.push(child);
}

// クエリの生成
const queries = createQuery();

// 実行
for (let i = 0; i < childs.length; ++i) {
  //getCapture(i);
  setup(i);
}

function exec_reg() {
  try {
    //reg
    //execSync('node ./node_modules/reg-cli/dist/cli.js ./results/development/ ./results/production/ ./results/diff/ -R ./results/report.html');
  } catch (err) {
    err.stdout;
    err.stderr;
    err.pid;
    err.signal;
    err.status;
  }
}
