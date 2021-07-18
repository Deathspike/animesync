import * as app from '../../..';
import commander from 'commander';

export function createSettingsCredential(format: <T>(description: string, value: T) => string) {
  return commander.createCommand('credential')
    .description('The credential settings.')
    .option('--crunchyrollUsername [string]', format('Crunchyroll username for premium/mature videos', app.settings.credential.crunchyrollUsername))
    .option('--crunchyrollPassword [string]', format('Crunchyroll password for premium/mature videos', app.settings.credential.crunchyrollPassword))
    .option('--funimationUsername [string]', format('Funimation username for premium/mature videos', app.settings.credential.funimationUsername))
    .option('--funimationPassword [string]', format('Funimation password for premium/mature videos', app.settings.credential.funimationPassword));
}
