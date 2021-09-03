const fs = require('fs');
const path = require('path');

(function () {
  const packagePath = path.join(__dirname, 'package.json');
  const prepackPath = packagePath + '.prepack';
  fs.renameSync(prepackPath, packagePath);
})();
