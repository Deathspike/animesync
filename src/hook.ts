import path from 'path';
const core = require('module');
const next = core['_load'];
const packageData = require('../package.json');

core['_load'] = function(request: string) {
  return fetchDependency(request)
    || fetchSelf(request)
    || next.apply(this, arguments);
};

function fetchDependency(request: string) {
  return Object.keys(packageData.dependencies)
    .map(x => route(path.join(__dirname, '../node_modules', x), x, request))
    .filter(x => x)
    .shift();
}

function fetchSelf(request: string) {
  const basePath = path.join(__dirname, '..');
  const name = packageData.name;
  return route(basePath, name, request);
}

function route(basePath: string, name: string, request: string) {
  const expressionName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = new RegExp(`^${expressionName}(?:\/(.*))?$`);
  const match = request.match(expression);
  if (match && match[1]) {
    return require(path.join(basePath, match[1]));
  } else if (match) {
    return require(basePath);
  } else {
    return undefined;
  }
}
