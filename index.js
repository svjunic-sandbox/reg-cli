const fs = require('fs');
const puppeteer = require('puppeteer');

const { fork, execSync } = require('child_process');

//const getCapture = require('./getCapture.js');

const { PATH_LIST, HOSTS } = require('./config.js');

const dirlist = ['./results/production', './results/development', './results/cli', './results/diff'];
for (let i = 0; i < dirlist.length; ++i) {
  let path = dirlist[i];
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}

const SUBROUTINE_SCRIPT_PATH = './getCapture.js';

function createQuery() {
  const queries = [];
  for (let i = 0; i < PATH_LIST.length; ++i) {
    let url = PATH_LIST[i];

    queries.push({
      url: `${HOSTS.production}${url}`,
      output: `results/production/${url
        .replace(/:/g, '')
        .replace(/\/$/g, '_index.html')
        .replace(/\//g, '_')
        .replace(/^_/g, '')}.png`
    });

    queries.push({
      url: `${HOSTS.development}${url}`,
      output: `results/development/${url
        .replace(/:/g, '')
        .replace(/\/$/g, '_index.html')
        .replace(/\//g, '_')
        .replace(/^_/g, '')}.png`
    });
  }

  return queries;
}

function getCapture(threadNumber) {
  const query = queries.length > 0 ? queries.shift() : undefined;
  const processExit = queries.length < childs.length;
  console.log({ query: query, processExit: processExit, threadNumber: threadNumber });
  childs[threadNumber].send({ query: query, processExit: processExit, threadNumber: threadNumber });
}

// 他プロセスの作成
const CPUs = require('os').cpus().length;
let usingThreadNumber = CPUs.length;
const childs = [];
for (let i = 0; i < CPUs; ++i) {
  let child = fork(SUBROUTINE_SCRIPT_PATH);
  child.on('message', function(data) {
    console.log(data);

    if (data.message === 'exit') usingThreadNumber--;

    if (usingThreadNumber === 0) {
      console.log('thread exit');
      exec_reg();
      return;
    }

    if (queries.length > 0) {
      console.log('2回目', queries.length);
      getCapture(data.threadNumber);
    }
  });
  childs.push(child);
}

// クエリの生成
const queries = createQuery();

// 実行
for (let i = 0; i < childs.length; ++i) {
  console.log('threadNumber', i);
  getCapture(i);
}

function exec_reg() {
  try {
    //reg
    execSync('node ./node_modules/reg-cli/dist/cli.js ./results/development/ ./results/production/ ./results/diff/ -R ./results/report.html');
    process.exit();
  } catch (err) {
    err.stdout;
    err.stderr;
    err.pid;
    err.signal;
    err.status;
  }
}
