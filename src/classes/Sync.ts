import * as app from '..';
import childProcess from 'child_process';
import crypto from 'crypto';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

export class Sync {
  private readonly _episodePath: string;
  private readonly _subtitlePath: string;

  constructor(episodePath: string, subtitleFormat: string, syncPath: string) {
    this._episodePath = episodePath;
    this._subtitlePath = `${path.join(syncPath, Date.now().toString(16) + crypto.randomBytes(24).toString('hex'))}.${subtitleFormat}`;
  }

  async disposeAsync() {
    await fs.remove(this._subtitlePath);
  }

  async saveAsync(manifestUrl: string, subtitle: string) {
    await fs.ensureDir(path.dirname(this._subtitlePath));
    await fs.writeFile(this._subtitlePath, subtitle);
    await fs.ensureDir(path.dirname(this._episodePath));
    await spawnAsync(ffmpeg(), ['-y',
      '-i', manifestUrl,
      '-i', this._subtitlePath,
      '-metadata:s:a:0', 'language=jpn',
      '-metadata:s:s:0', 'language=eng',
      '-c', 'copy', this._episodePath]);
  }
}

function ffmpeg() {
  if (os.platform() !== 'win32') return 'ffmpeg';
  return path.join(__dirname, `../../dep/ffmpeg.exe`)
}

async function spawnAsync(command: string, args: string[]) {
  app.logger.debug(`spawn ${command} ${JSON.stringify(args)}`);
  const future = new app.Future<void>();
  const process = childProcess.spawn(command, args);
  process.stdout.on('data', (chunk: Buffer) => app.logger.debug(chunk.toString('utf-8').trim()));
  process.stderr.on('data', (chunk: Buffer) => app.logger.debug(chunk.toString('utf-8').trim()));
  process.on('error', (error) => future.reject(error));
  process.on('exit', () => future.resolve());
  await future.getAsync();
}
