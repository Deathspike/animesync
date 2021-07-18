import * as app from '../..';
import * as cli from '..';
import commander from 'commander';
import readline from 'readline';
const serverPort = 6583;

export function createServer() {
  return commander.createCommand('server')
    .description('Runs the server.')
    .action(serverAsync);
}

async function serverAsync(this: cli.IOptions) {
  await app.Server.usingAsync(async (api) => {
    const reader = readline.createInterface(process.stdin, process.stdout);
    api.logger.info(`Listening at ${api.context.serverUrl}`);
    api.logger.info('Press [ENTER] to exit the server.');
    await new Promise<void>((resolve) => reader.on('line', () => {
      reader.close();
      resolve();
    }));
  }, serverPort);
}
