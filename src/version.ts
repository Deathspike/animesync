const packageData = require('../package');
const current = Number(process.version.match(/(\d+)\.\d+\.\d/)?.pop() ?? 0);
const minimum = Number(packageData.engines.node.match(/(\d+)\.\d+\.\d/)?.pop() ?? 0);
if (current < minimum) throw new Error(`Invalid node version: Must be ${packageData.engines.node}`);
