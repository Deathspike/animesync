import * as app from '..';
import * as subtitle from 'subtitle';
import childProcess from 'child_process';
import crypto from 'crypto';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

export class Sync {
  private readonly _episodePath: string;
  private readonly _syncPath: string;

  constructor(episodePath: string) {
    this._episodePath = episodePath;
    this._syncPath = path.join(app.settings.sync, Date.now().toString(16) + crypto.randomBytes(24).toString('hex'));
  }

  async saveAsync(stream: app.IApiStream) {
    const bestStream = await this._bestStreamAsync(stream);
    const subtitlePath = await this._subtitleAsync(stream);
    if (bestStream && subtitlePath) try {
      await fs.ensureDir(path.dirname(this._episodePath));
      await spawnAsync(ffmpeg(), ['-y',
        '-i', bestStream.url,
        '-i', subtitlePath,
        '-metadata:s:a:0', 'language=jpn',
        '-metadata:s:s:0', 'language=eng',
        '-c', 'copy', this._episodePath]);
    } finally {
      await fs.remove(this._syncPath);
    } else {
      throw new Error();
    }
  }

  private async _bestStreamAsync(stream: app.IApiStream) {
    const manifestData = await fetch(stream.manifestUrl).then(x => x.text());
    const manifest = app.HlsManifest.from(manifestData);
    return manifest.fetchStreams().shift();
  }
  
  private async _subtitleAsync(stream: app.IApiStream) {
    if (stream.subtitleType === 'vtt') {
      const subtitleData = await fetch(stream.subtitleUrl).then(x => x.text());
      const subtitlePath = path.join(this._syncPath, `eng.srt`);
      await fs.ensureDir(this._syncPath);
      await fs.writeFile(subtitlePath, subtitle.stringifySync(subtitle.parseSync(subtitleData), {format: 'SRT'}));
      return subtitlePath;
    } else {
      const subtitleData = await fetch(stream.subtitleUrl).then(x => x.text());
      const subtitlePath = path.join(this._syncPath, `eng.${stream.subtitleType}`);
      await fs.ensureDir(this._syncPath);
      await fs.writeFile(subtitlePath, subtitleData);
      return subtitlePath;
    }
  }
}

function ffmpeg() {
  if (os.platform() !== 'win32') return 'ffmpeg';
  return path.join(__dirname, `../../dep/ffmpeg.exe`)
}

async function spawnAsync(command: string, args: Array<string>) {
  app.logger.debug(`spawn ${command} ${JSON.stringify(args)}`);
  const future = new app.Future<void>();
  const process = childProcess.spawn(command, args);
  process.stdout.on('data', (chunk: Buffer) => app.logger.debug(chunk.toString('utf-8').trim()));
  process.stderr.on('data', (chunk: Buffer) => app.logger.debug(chunk.toString('utf-8').trim()));
  process.on('error', (error) => future.reject(error));
  process.on('exit', () => future.resolve());
  await future.getAsync();
}
