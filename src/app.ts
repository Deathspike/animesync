import * as app from '.';
import commander from 'commander';
import fs from 'fs-extra';
import path from 'path';

commander.createCommand()
  .description(require('../package').description)
  .name(require('../package').name)
  .version(require('../package').version)
  .addCommand(commander.createCommand('browser')
    .description('Launch browser.')
    .action(app.actions.browserAsync))
  .addCommand(commander.createCommand('download')
    .arguments('[seriesUrl...]')
    .description('Downloads series.')
    .action(app.actions.downloadAsync))
  .addCommand(commander.createCommand('series')
    .description('Manage series.')
    .addCommand(commander.createCommand('add')
      .arguments('<seriesUrl> [rootPath]')
      .description('Adds the series.')
      .action(app.actions.seriesAddAsync))
    .addCommand(commander.createCommand('list')
      .description('Lists each series.')
      .action(app.actions.seriesListAsync))
    .addCommand(commander.createCommand('remove')
      .arguments('<seriesUrl>')
      .description('Removes the series.')
      .action(app.actions.seriesRemoveAsync)))
  .addCommand(commander.createCommand('settings')
    .description('Manage settings.')
    .option('--chrome [string]', withCurrent('Path to chrome-data.', app.settings.chrome), validatePath)
    .option('--library [string]', withCurrent('Path to library. Completed videos are here.', app.settings.library), validatePath)
    .option('--sync [string]', withCurrent('Path to sync. Videos are downloaded here:', app.settings.sync), validatePath)
    .option('--chromeHeadless [bool]', withCurrent('Chrome headless mode.', app.settings.chromeHeadless), primitiveBoolean)
    .option('--chromeInactiveTimeout [number]', withCurrent('Chrome inactive timeout in milliseconds.', app.settings.chromeInactiveTimeout), primitiveNumber)
    .option('--chromeNavigationTimeout [number]', withCurrent('Chrome navigation timeout in milliseconds.', app.settings.chromeNavigationTimeout), primitiveNumber)
    .option('--chromeObserverTimeout [number]', withCurrent('Chrome observation timeout in milliseconds.', app.settings.chromeObserverTimeout), primitiveNumber)
    .option('--chromeViewport [string]', withCurrent('Chrome viewport while headless.', app.settings.chromeViewport), validateViewport)
    .option('--proxyServer [string]', withCurrent('Proxy server (HTTP or HTTPS).', app.settings.proxyServer), validateProxyServer)
    .action((command) => app.actions.settingsAsync(command).then((showHelp) => showHelp && command.help())))
  .parse();

function primitiveBoolean(value: string) {
  return /^yes|true|1/.test(value);
}

function primitiveNumber(value: string) {
  return parseInt(value, 10) > 0 ? parseInt(value, 10) : undefined;
}

function validatePath(value: string) {
  return fs.pathExistsSync(value) ? path.resolve(value) : undefined;
}

function validateProxyServer(value: string) {
  return /^(https?)\:\/\/(?:(.+)\:(.+)@)?((?:.+)\.(?:.+))$/i.test(value) ? value : undefined;
}

function validateViewport(value: string) {
  return /^[0-9]+x[0-9]+$/.test(value) ? value : undefined;
}

function withCurrent<T>(description: string, value: T) {
  return `${description}\n⠀⠀${value}`;
}
