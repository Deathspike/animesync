import * as app from '..';
import commander from 'commander';
import readline from 'readline';

export function createServer() {
  return commander.createCommand('server')
    .description('Runs the server.')
    .action(serverAsync);
}

async function serverAsync(this: app.Options) {
  await app.Server.usingAsync(async (api) => {
    const reader = readline.createInterface(process.stdin, process.stdout);
    api.logger.info(`Listening at ${app.settings.server.url}`);
    api.logger.info('Press [ENTER] to exit the server.');
    await new Promise<void>((resolve) => reader.on('line', () => {
      reader.close();
      resolve();
    }));
  });
}
