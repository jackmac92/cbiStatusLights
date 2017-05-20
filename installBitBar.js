const fetch = require('isomorphic-fetch');
const fs = require('fs');
const Listr = require('listr');

const getRepoInfo = repo =>
  fetch(`https://api.github.com/repos/${repo}/releases/latest`).then(res =>
    res.json()
  );

const getRepoAssets = assetsUrl => fetch(assetsUrl).then(res => res.json());

const findAssetUrl = allAssets =>
  allAssets.filter(a => !a.name.includes('Distro'))[0].browser_download_url;

const downloadZip = url =>
  fetch(url).then(res => {
    const file = fs.createWriteStream('./bitbar.zip');
    res.body.pipe(file);
  });

new Listr([
  {
    title: 'Getting information about releases',
    task: ctx =>
      getRepoInfo('matryer/bitbar').then(res => {
        ctx.assetsUrl = res.assets_url;
      })
  },
  {
    title: 'Finding url download latest release',
    task: ctx =>
      getRepoAssets(ctx.assetsUrl).then(findAssetUrl).then(url => {
        ctx.downloadUrl = url;
      })
  },
  {
    title: 'Downloading',
    task: ctx => downloadZip(ctx.downloadUrl)
  }
])
  .run()
  .catch(err => {
    console.log(err);
  });
