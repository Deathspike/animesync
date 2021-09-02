import * as cli from '..';
import commander from 'commander';
const packageData = require('../../../../package');

export function create() {
  return commander.createCommand()
    .description(packageData.description)
    .version(packageData.version)
    .addCommand(cli.createDownload())
    .addCommand(cli.createUpdate())
    .addCommand(cli.createBrowser())
    .addCommand(cli.createServer())
    .addCommand(cli.createSettings());
}
