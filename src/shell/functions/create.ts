import * as app from '..';
import commander from 'commander';
const packageData = require('../../../package');

export function create() {
  return commander.createCommand()
    .description(packageData.description)
    .version(packageData.version)
    .addCommand(app.createDownload())
    .addCommand(app.createUpdate())
    .addCommand(app.createBrowser())
    .addCommand(app.createServer())
    .addCommand(app.createSettings());
}
