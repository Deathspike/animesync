import fs from 'fs-extra';
import path from 'path';
const core = require('module');
const next = core['_load'];
const packageData = require('../package');

core['_load'] = function(request: string) {
  return fetchDependency(request)
    || fetchSelf(request)
    || next.apply(this, arguments);
};

function fetchDependency(request: string) {
  return Object.keys(packageData.dependencies)
    .map(x => match(x, request, (y, z) => route(path.join(__dirname, '../node_modules'), path.join(y, z))))
    .filter(x => x)
    .shift();
}

function fetchSelf(request: string) {
  const name = packageData.name;
  return match(name, request, (_, p) => route(path.join(__dirname, '..'), p));
}

function match(name: string, request: string, require: (module: string, path: string) => any) {
  const expressionName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = new RegExp(`^(${expressionName})(?:\/(.*))?$`);
  const match = request.match(expression);
  return match ? require(match[1], match[2] ?? '') : undefined;
}

function route(basePath: string, relativePath: string) {
  while (true) {
    const modulePath = path.resolve(basePath, relativePath);
    if (fs.existsSync(modulePath) || fs.existsSync(`${modulePath}.js`)) return require(modulePath);
    basePath = path.dirname(basePath);
  }
}
