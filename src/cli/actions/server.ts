import * as app from '../..';
import * as cli from '..';
import readline from 'readline';

export async function serverAsync(this: cli.IOptions) {
  await app.Server.usingAsync(async (api) => {
    const reader = readline.createInterface(process.stdin, process.stdout);
    console.info(`Listening at ${api.context.serverUrl}`);
    console.info('Press [ENTER] to exit the server.');
    await new Promise<void>((resolve) => reader.on('line', () => {
      reader.close();
      resolve();
    }));
  }, 6583);
}
