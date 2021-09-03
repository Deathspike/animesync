const fs = require('fs');
const path = require('path');

(function () {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = fs.readFileSync(packagePath, 'utf8');
  const packageData = JSON.parse(packageJson);
  const prepackPath = packagePath + '.prepack';

  packageData.dependencies = Object.fromEntries(packageData.workspaces
    .map(x => require(path.join(__dirname, x, 'package.json')))
    .map(x => x.dependencies ?? {})
    .flatMap(x => Object.entries(x))
    .sort(([a], [b]) => a.localeCompare(b)));
  Object.keys(packageData.scripts)
    .filter(x => !x.includes('postinstall'))
    .forEach(x => delete packageData.scripts[x]);
  delete packageData.devDependencies;
  delete packageData.jest;
  delete packageData.workspaces;

  fs.writeFileSync(prepackPath, packageJson);
  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
})();
