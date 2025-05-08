const paths = [
  './warps.js',
  './warp.js'
];

paths.forEach(path => import(path));