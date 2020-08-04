//import { Cluster } from 'puppeteer-cluster';
//import createdir from './modules/createdir.js';
//import OS from 'os';

const { Cluster } = require('puppeteer-cluster');
const OS = require('os');
const createdir = require('./modules/createdir.js');
const createQuery = require('./modules/createQuery.js');
const capture = require('./modules/capture.js');

const version = process.argv[2];
const device = process.argv[3];

const CPUs = OS.cpus().length;
//const CPUs = 1;

// ディレクトリ作成
createdir(version);

// クエリの作成
const queries = createQuery({ device, version });

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    monitor: true,
    //maxConcurrency: 1,
    maxConcurrency: CPUs,
  });

  await cluster.task(async ({ page, data }) => {
    //console.log(data);
    await capture({ page, data });
    // Store screenshot, do something else
  });

  for (let i = 0; i < queries.length; ++i) {
    const data = queries[i];
    //console.log(data);
    cluster.queue(data);
  }
  // many more pages

  await cluster.idle();
  await cluster.close();
})();
