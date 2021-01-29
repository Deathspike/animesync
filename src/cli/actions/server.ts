import * as app from '../..';
import * as cli from '..';
import readline from 'readline';

export async function serverAsync(this: cli.IOptions) {
  console.info(`Starting ${app.settings.serverUrl}`);
  await app.Server.usingAsync(async () => {
    const reader = readline.createInterface(process.stdin, process.stdout);
    console.info('Press [ENTER] to exit the server.');
    await new Promise<void>((resolve) => reader.on('line', () => {
      reader.close();
      resolve();
    }));
  });
}
