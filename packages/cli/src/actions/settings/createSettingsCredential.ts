import * as app from '../..';
import commander from 'commander';

export function createSettingsCredential(format: <T>(description: string, value: T) => string) {
  return commander.createCommand('credential')
    .description('The credential settings.')
    .option('--crunchyrollUsername [string]', format('Crunchyroll username.', app.settings.credential.crunchyrollUsername))
    .option('--crunchyrollPassword [string]', format('Crunchyroll password.', app.settings.credential.crunchyrollPassword))
    .option('--funimationUsername [string]', format('Funimation username.', app.settings.credential.funimationUsername))
    .option('--funimationPassword [string]', format('Funimation password.', app.settings.credential.funimationPassword))
    .option('--vrvUsername [string]', format('Vrv username.', app.settings.credential.vrvUsername))
    .option('--vrvPassword [string]', format('Vrv password.', app.settings.credential.vrvPassword));
}
