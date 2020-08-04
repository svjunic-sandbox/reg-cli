//import fs from 'fs';
const fs = require('fs');

const createdir = (version) => {
  const dirlist = [];

  switch (version) {
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

  for (let i = 0; i < dirlist.length; ++i) {
    let path = dirlist[i];
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  }
};

module.exports = createdir;
//export default createdir;
