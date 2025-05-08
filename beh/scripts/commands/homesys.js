const paths = [
  './listhomes.js',
  './home.js',
  './sethome.js'
];

paths.forEach(path => import(path));