import * as app from '..';
import * as cli from '.';
import commander from 'commander';
import process from 'process';

commander.createCommand()
  .description(require('../../package').description)
  .version(require('../../package').version)
  .addCommand(commander.createCommand('browser')
    .description('Launch browser.')
    .action(checkStart(cli.actions.browserAsync)))
  .addCommand(commander.createCommand('download')
    .arguments('[seriesUrl...]')
    .description('Downloads series.')
    .option('--rootPath [string]', 'Specifies the root directory for the series.')
    .option('--skipDownload', 'Generate tracking files but skip downloads.')
    .action(checkStart(cli.actions.downloadAsync)))
  .addCommand(commander.createCommand('server')
    .description('Runs the server.')
    .action(checkStart(cli.actions.serverAsync)))
  .addCommand(commander.createCommand('settings')
    .description('Manage settings.')
    .addCommand(commander.createCommand('core')
      .description('The core settings.')
      .option('--chromeHeadless [bool]', withCurrent('Chrome headless mode.', app.settings.core.chromeHeadless), primitiveBoolean)
      .option('--chromeInactiveTimeout [number]', withCurrent('Chrome inactive timeout in milliseconds.', app.settings.core.chromeTimeoutInactive), primitiveNumber)
      .option('--chromeNavigationTimeout [number]', withCurrent('Chrome navigation timeout in milliseconds.', app.settings.core.chromeTimeoutNavigation), primitiveNumber)
      .option('--chromeViewport [string]', withCurrent('Chrome viewport while headless.', app.settings.core.chromeViewport))
      .option('--fetchMaximumRetries [number]', withCurrent('Fetch maximum retries.', app.settings.core.fetchMaximumRetries), primitiveNumber)
      .option('--fetchTimeoutRequest [number]', withCurrent('Fetch request timeout in milliseconds.', app.settings.core.fetchTimeoutRequest), primitiveNumber)
      .option('--fetchTimeoutRetry [number]', withCurrent('Fetch retry timeout in milliseconds.', app.settings.core.fetchTimeoutRetry), primitiveNumber)
      .option('--ffmpeg [string]', withCurrent('Path to custom ffmpeg executable.', app.settings.core.ffmpeg))
      .option('--proxyServer [string]', withCurrent('Proxy server for network traffic.', app.settings.core.proxyServer))
      .action((command) => cli.actions.settingsAsync(command).then((showHelp) => showHelp && command.help())))
    .addCommand(commander.createCommand('credential')
      .description('The credential settings.')
      .option('--crunchyrollUsername [string]', withCurrent('Crunchyroll username for premium/mature videos', app.settings.credential.crunchyrollUsername))
      .option('--crunchyrollPassword [string]', withCurrent('Crunchyroll password for premium/mature videos', app.settings.credential.crunchyrollPassword))
      .option('--funimationUsername [string]', withCurrent('Funimation username for premium/mature videos', app.settings.credential.funimationUsername))
      .option('--funimationPassword [string]', withCurrent('Funimation password for premium/mature videos', app.settings.credential.funimationPassword))
      .action((command) => cli.actions.settingsAsync(command).then((showHelp) => showHelp && command.help())))
    .addCommand(commander.createCommand('path')
      .description('The path settings.')
      .option('--cache [string]', withCurrent('Path to cache data.', app.settings.path.cache))
      .option('--chrome [string]', withCurrent('Path to chrome data.', app.settings.path.chrome))
      .option('--library [string]', withCurrent('Path to library.', app.settings.path.library))
      .option('--logger [string]', withCurrent('Path to logger.', app.settings.path.logger))
      .option('--sync [string]', withCurrent('Path to sync.', app.settings.path.sync))
      .action((command) => cli.actions.settingsAsync(command).then((showHelp) => showHelp && command.help()))))
  .parse();

function checkStart(fn: Function) {
  return function(this: cli.IOptions) {
    if ((process.version.match(/^v(\d+)\.\d+\.\d$/)?.pop() ?? 0) < 14) throw new Error(`Invalid node version: Must be >= 14`);
    return fn.apply(this, arguments);
  };
}

function primitiveBoolean(value: string) {
  return /^yes|true|1/.test(value);
}

function primitiveNumber(value: string) {
  return Number(value);
}

function withCurrent<T>(description: string, value: T) {
  return `${description}\n-> ${value || ''}`;
}
