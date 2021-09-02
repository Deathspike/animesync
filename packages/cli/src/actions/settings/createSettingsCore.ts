import * as app from '../..';
import commander from 'commander';

export function createSettingsCore(format: <T>(description: string, value: T) => string) {
  return commander.createCommand('core')
    .description('The core settings.')
    .option('--chromeHeadless [bool]', format('Chrome headless mode.', app.settings.core.chromeHeadless), x => /^yes|true|1/.test(x))
    .option('--chromeTimeout [number]', format('Chrome inactive timeout.', app.settings.core.chromeTimeout), Number)
    .option('--chromeTimeoutAction [number]', format('Chrome timeout for actions.', app.settings.core.chromeTimeoutAction), Number)
    .option('--chromeTimeoutNavigation [number]', format('Chrome timeout for navigation.', app.settings.core.chromeTimeoutNavigation), Number)
    .option('--chromeViewport [string]', format('Chrome viewport dimensions.', app.settings.core.chromeViewport))
    .option('--fetchMaximumRetries [number]', format('Fetch maximum retries.', app.settings.core.fetchMaximumRetries), Number)
    .option('--fetchTimeoutRequest [number]', format('Fetch timeout for requests.', app.settings.core.fetchTimeoutRequest), Number)
    .option('--fetchTimeoutRetry [number]', format('Fetch timeout for retries.', app.settings.core.fetchTimeoutRetry), Number)
    .option('--ffmpeg [string]', format('The ffmpeg command.', app.settings.core.ffmpeg))
    .option('--proxyServer [string]', format('The proxy server.', app.settings.core.proxyServer));
}
