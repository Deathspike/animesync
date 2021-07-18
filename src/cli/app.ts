import {createBrowser} from './actions/createBrowser';
import {createDownload} from './actions/createDownload';
import {createServer} from './actions/createServer';
import {createSettings} from './actions/createSettings';
import {createUpdate} from './actions/createUpdate';
import commander from 'commander';
import process from 'process';
const packageData = require('../../package');

if (Number(process.version.match(/(\d+)\.\d+\.\d/)?.pop() ?? 0) >= Number(packageData.engines.node.match(/(\d+)\.\d+\.\d/)?.pop() ?? 0)) {
  commander.createCommand()
    .description(packageData.description)
    .version(packageData.version)
    .addCommand(createDownload())
    .addCommand(createUpdate())
    .addCommand(createBrowser())
    .addCommand(createServer())
    .addCommand(createSettings())
    .parse();
} else {
  throw new Error(`Invalid node version: Must be ${packageData.engines.node}`);
}
