import childProcess from 'child_process';
const packageData = require('../../../package');
enforceVersion(childProcess.execSync('npm -v').toString().trim(), packageData.engines.npm, 'npm');
enforceVersion(childProcess.execSync('node -v').toString().trim(), packageData.engines.node, 'node');

function enforceVersion(currentText: string, requiredText: string, type: string) {
  const c = parseVersion(currentText);
  const r = parseVersion(requiredText);
  if (c.major > r.major) return;
  if (c.major === r.major && c.minor > r.minor) return;
  if (c.minor === r.minor && c.minor === r.minor && c.patch > r.patch) return;
  throw new Error(`Invalid ${type} version: ${currentText}; should be ${requiredText}`);
}

function parseVersion(text: string) {
  const match = text.match(/([0-9]+)\.([0-9]+)\.([0-9]+)/);
  const major = Number(match && match[1]);
  const minor = Number(match && match[2]);
  const patch = Number(match && match[3]);
  return {major, minor, patch};
}
