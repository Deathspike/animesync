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

  async saveAsync(streamUrl: string, subtitle: string, options?: {broker?: app.Broker, userAgent?: string}) {
    const cli = {'user_agent': options?.userAgent};
    const env = {'http_proxy': options?.broker?.address};
    await fs.ensureDir(path.dirname(this._subtitlePath));
    await fs.writeFile(this._subtitlePath, subtitle);
    await fs.ensureDir(path.dirname(this._episodePath));
    await spawnAsync(ffmpeg(), parse(cli).concat(['-y', '-i', streamUrl, '-i', this._subtitlePath, '-c', 'copy', this._episodePath]), env);
  }
}

function ffmpeg() {
  if (os.platform() !== 'win32') return 'ffmpeg';
  return path.join(__dirname, `../../dep/ffmpeg.exe`)
}

function parse(obj: Record<string, string | undefined>) {
  return Object.entries(obj)
    .filter(([_, v]) => Boolean(v))
    .map(([k, v]) => ([`-${k}`, v!]))
    .reduce((c, p) => p.concat(c), []);
}

async function spawnAsync(command: string, args: string[], env: Record<string, any>) {
  app.logger.debug(`spawn ${command} ${JSON.stringify(args)} ${JSON.stringify({env})}`);
  const future = new app.Future<void>();
  const process = childProcess.spawn(command, args, {env});
  process.stdout.on('data', (chunk: Buffer) => app.logger.debug(chunk.toString('utf-8')));
  process.stderr.on('data', (chunk: Buffer) => app.logger.debug(chunk.toString('utf-8')));
  process.on('error', (error) => future.reject(error));
  process.on('exit', () => future.resolve());
  await future.getAsync();
}
