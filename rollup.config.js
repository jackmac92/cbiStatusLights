import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import json from 'rollup-plugin-json';

let pkg = require('./package.json');

export default {
  entry: 'index.js',
  dest: 'bundle.js',
  moduleName: 'MyModule',
  format: 'cjs',
  plugins: [
    globals(),
    builtins(),
    json(),
    commonjs({
      include: 'node_modules/**',
      exclude: '**/*.css'
    }),
    resolve({
      preferModules: true, // Default: true
      preferBuiltins: false // Default: true
    })
  ]
};

// https://gist.github.com/developit/41f088b6294e2591f53b
// import path from 'path';
// import fs from 'fs';
// import babel from 'rollup-plugin-babel';
// import npm from 'rollup-plugin-npm';
// import commonjs from 'rollup-plugin-commonjs';

// let pkg = JSON.parse(fs.readFileSync('./package.json')),
//     external = Object.keys(pkg.dependencies || {}),
//     babelRc = pkg.babel || JSON.parse(fs.readFileSync('./.babelrc'));

// export default {
//     entry: pkg['jsnext:main'] || 'src/index.js',
//     dest: pkg.main,
//     sourceMap: path.resolve(pkg.main),
//     moduleName: pkg.amdName || pkg.name,
//     format: process.env.FORMAT || 'umd',
//     external,
//     plugins: [
//         babel({
//             babelrc: false,
//             ...babelRc
//         }),
//         npm({
//             jsnext: true,
//             main: true,
//             skip: external
//         }),
//         commonjs({
//             include: 'node_modules/**',
//             exclude: '**/*.css'
//         })
//     ]
// };

// var rollup = require( 'rollup' );

// // used to track the cache for subsequent bundles
// var cache;

// rollup.rollup({
//   // The bundle's starting point. This file will be
//   // included, along with the minimum necessary code
//   // from its dependencies
//   entry: 'main.js',
//   // If you have a bundle you want to re-use (e.g., when using a watcher to rebuild as files change),
//   // you can tell rollup use a previous bundle as its starting point.
//   // This is entirely optional!
//   cache: cache
// }).then( function ( bundle ) {
//   // Generate bundle + sourcemap
//   var result = bundle.generate({
//     // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
//     format: 'cjs'
//   });

//   // Cache our bundle for later use (optional)
//   cache = bundle;

//   fs.writeFileSync( 'bundle.js', result.code );

//   // Alternatively, let Rollup do it for you
//   // (this returns a promise). This is much
//   // easier if you're generating a sourcemap
//   bundle.write({
//     format: 'cjs',
//     dest: 'bundle.js'
//   });
// });
