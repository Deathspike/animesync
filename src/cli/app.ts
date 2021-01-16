import * as ace from '..';
import * as acm from '.';
import commander from 'commander';
import fs from 'fs-extra';
import path from 'path';
import process from 'process';

commander.createCommand()
  .description(require('../../package').description)
  .name(require('../../package').name)
  .version(require('../../package').version)
  .addCommand(commander.createCommand('browser')
    .description('Launch browser.')
    .action(checkStart(acm.actions.browserAsync)))
  .addCommand(commander.createCommand('download')
    .arguments('[seriesUrl...]')
    .description('Downloads series.')
    .option('--skipDownload', 'Generate tracking files but skip downloads.')
    .action(checkStart(acm.actions.downloadAsync)))
  .addCommand(commander.createCommand('series')
    .description('Manage series.')
    .addCommand(commander.createCommand('add')
      .arguments('<seriesUrl> [rootPath]')
      .description('Adds the series.')
      .action(checkStart(acm.actions.seriesAddAsync)))
    .addCommand(commander.createCommand('list')
      .description('Lists each series.')
      .action(checkStart(acm.actions.seriesListAsync)))
    .addCommand(commander.createCommand('remove')
      .arguments('<seriesUrl>')
      .description('Removes the series.')
      .action(checkStart(acm.actions.seriesRemoveAsync))))
  .addCommand(commander.createCommand('server')
    .description('Runs the server.')
    .action(checkStart(acm.actions.serverAsync)))
  .addCommand(commander.createCommand('settings')
    .description('Manage settings.')
    .option('--chrome [string]', withCurrent('Path to chrome-data.', ace.settings.chrome), validatePath)
    .option('--library [string]', withCurrent('Path to library. Video files are stored here.', ace.settings.library), validatePath)
    .option('--sync [string]', withCurrent('Path to sync. Temporary files are stored here.', ace.settings.sync), validatePath)
    .option('--chromeHeadless [bool]', withCurrent('Chrome headless mode.', ace.settings.chromeHeadless), primitiveBoolean)
    .option('--chromeInactiveTimeout [number]', withCurrent('Chrome inactive timeout in milliseconds.', ace.settings.chromeInactiveTimeout), primitiveNumber)
    .option('--chromeNavigationTimeout [number]', withCurrent('Chrome navigation timeout in milliseconds.', ace.settings.chromeNavigationTimeout), primitiveNumber)
    .option('--chromeObserverTimeout [number]', withCurrent('Chrome observation timeout in milliseconds.', ace.settings.chromeObserverTimeout), primitiveNumber)
    .option('--chromeViewport [string]', withCurrent('Chrome viewport while headless.', ace.settings.chromeViewport), validateViewport)
    .option('--proxyServer [string]', withCurrent('Proxy server for network traffic.', ace.settings.proxyServer), validateProxyServer)
    .action((command) => acm.actions.settingsAsync(command).then((showHelp) => showHelp && command.help())))
  .parse();

function checkStart(fn: Function) {
  return function(this: acm.IOptions) {
    if ((process.version.match(/^v(\d+)\.\d+\.\d$/)?.pop() ?? 0) < 12) throw new Error(`Invalid node version: Must be >= 12`);
    return fn.apply(this, arguments);
  };
}

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
  if (/^(http|https|socks|socks4|socks5)\:\/\/(?:(.+)\:(.+)@)?((?:.+)\.(?:.+))$/i.test(value)) return value;
  if (/^nordvpn\:\/\/(?:(.+)\:(.+)@)?(?:.+)$/i.test(value)) return value;
  return undefined;
}

function validateViewport(value: string) {
  return /^[0-9]+x[0-9]+$/.test(value) ? value : undefined;
}

function withCurrent<T>(description: string, value: T) {
  return `${description}\n-> ${value}`;
}
