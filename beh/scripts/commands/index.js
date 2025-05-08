const paths = [
  './worldedit.js',
  './warpsys.js',
  './homesys.js',
  './credits.js',
  './info.js',
  './help.js',
  './plugins.js',
  './menu.js'
];

paths.forEach(path => import(path));