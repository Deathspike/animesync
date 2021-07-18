import * as app from '../../..';
import commander from 'commander';

export function createSettingsPath(format: <T>(description: string, value: T) => string) {
  return commander.createCommand('path')
    .description('The path settings.')
    .option('--cache [string]', format('Path to cache data.', app.settings.path.cache))
    .option('--chrome [string]', format('Path to chrome data.', app.settings.path.chrome))
    .option('--library [string]', format('Path to library.', app.settings.path.library))
    .option('--logger [string]', format('Path to logger.', app.settings.path.logger))
    .option('--sync [string]', format('Path to sync.', app.settings.path.sync));
}
