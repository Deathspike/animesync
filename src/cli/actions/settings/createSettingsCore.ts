import * as app from '../../..';
import commander from 'commander';

export function createSettingsCore(format: <T>(description: string, value: T) => string) {
  return commander.createCommand('core')
    .description('The core settings.')
    .option('--chromeHeadless [bool]', format('Chrome headless mode.', app.settings.core.chromeHeadless), x => /^yes|true|1/.test(x))
    .option('--chromeInactiveTimeout [number]', format('Chrome inactive timeout in milliseconds.', app.settings.core.chromeTimeoutInactive), Number)
    .option('--chromeNavigationTimeout [number]', format('Chrome navigation timeout in milliseconds.', app.settings.core.chromeTimeoutNavigation), Number)
    .option('--chromeViewport [string]', format('Chrome viewport while headless.', app.settings.core.chromeViewport))
    .option('--fetchMaximumRetries [number]', format('Fetch maximum retries.', app.settings.core.fetchMaximumRetries), Number)
    .option('--fetchTimeoutRequest [number]', format('Fetch request timeout in milliseconds.', app.settings.core.fetchTimeoutRequest), Number)
    .option('--fetchTimeoutRetry [number]', format('Fetch retry timeout in milliseconds.', app.settings.core.fetchTimeoutRetry), Number)
    .option('--ffmpeg [string]', format('Path to custom ffmpeg executable.', app.settings.core.ffmpeg))
    .option('--proxyServer [string]', format('Proxy server for network traffic.', app.settings.core.proxyServer));
}
