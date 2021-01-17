import * as ace from '../..';
import * as acm from '..';
import readline from 'readline';

export async function serverAsync(this: acm.IOptions) {
  console.info(`Starting ${ace.settings.serverUrl}`);
  await ace.Server.usingAsync(async () => {
    const reader = readline.createInterface(process.stdin, process.stdout);
    console.info('Press [ENTER] to exit the server.');
    await new Promise<void>((resolve) => reader.on('line', () => {
      reader.close();
      resolve();
    }));
  });
}
