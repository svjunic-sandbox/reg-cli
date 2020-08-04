//import { PATH_LIST, UA, HOSTS } from './config.js';
const { PATH_LIST, UA, HOSTS } = require('./config.js');

const createQuery = ({ device, version }) => {
  const PATH_LIST_DEVICE = PATH_LIST[device];

  const queries = [];

  let ua = '';
  switch (device) {
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

  for (let i = 0; i < PATH_LIST_DEVICE.length; ++i) {
    let url = PATH_LIST_DEVICE[i];

    queries.push({
      url: `${HOSTS.production}${url}`,
      device: device,
      ua: ua,
      output: `results/${device}/${version}/${url.replace(/:/g, '').replace(/\/$/g, '_index.html').replace(/\//g, '_').replace(/^_/g, '')}.png`,
    });
  }

  return queries;
};

module.exports = createQuery;
//export default createQuery;
