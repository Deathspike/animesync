import * as app from '../..';
import commander from 'commander';

export function createSettingsCredential(format: <T>(description: string, value: T) => string) {
  return commander.createCommand('credential')
    .description('The credential settings.')
    .option('--crunchyrollUsername [string]', format('Crunchyroll username.', app.settings.credential.crunchyrollUsername))
    .option('--crunchyrollPassword [string]', format('Crunchyroll password.', app.settings.credential.crunchyrollPassword));
}
