const fetch = require('isomorphic-fetch');
const fs = require('fs');

fetch('https://api.github.com/repos/matryer/bitbar/releases/latest')
  .then(res => res.json())
  .then(({ assets_url }) => fetch(assets_url).then(res => res.json()))
  .then(allAssets => allAssets.filter(a => !a.name.includes('Distro'))[0])
  .then(({ browser_download_url }) => fetch(browser_download_url))
  .then(res => {
    const file = fs.createWriteStream('./bitbar.zip');
    res.body.pipe(file);
  });
