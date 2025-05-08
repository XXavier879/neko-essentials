const paths = [
  './pos1.js',
  './pos2.js',
  './set.js',
  './sphere.js',
  './copy.js',
  './paste.js'
];

paths.forEach(path => import(path));