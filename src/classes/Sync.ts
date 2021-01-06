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
    const subtitles = await this._subtitlesAsync(stream);
    if (bestStream && subtitles) try {
      const foreignSubtitles = subtitles
        .filter(x => x.language !== 'eng')
        .sort((a, b) => a.language.localeCompare(b.language));
      const sortedSubtitles = subtitles
        .filter(x => x.language === 'eng')
        .concat(foreignSubtitles);
      const inputs = [['-i', bestStream.url]]
        .concat(sortedSubtitles.map(x => (['-i', x.subtitlePath])))
        .reduce((p, c) => p.concat(c))
      const mappings = [['-map', '0:v', '-map', '0:a']]
        .concat(sortedSubtitles.map((_, i) => ['-map', String(i + 1)]))
        .reduce((p, c) => p.concat(c));
      const metadata = sortedSubtitles
        .map((x, i) => [`-metadata:s:s:${i}`, `language=${x.language}`])
        .reduce((p, c) => p.concat(c));
      await fs.ensureDir(path.dirname(this._episodePath));
      await spawnAsync(ffmpeg(), ['-y']
        .concat(inputs)
        .concat(mappings)
        .concat(['-metadata:s:a:0', 'language=jpn'])
        .concat(metadata)
        .concat(['-c', 'copy', this._episodePath]));
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
  
  private async _subtitlesAsync(stream: app.IApiStream) {
    await fs.ensureDir(this._syncPath);
    return await Promise.all(stream.subtitles.map(async (x, i) => {
      if (x.type === 'vtt') {
        const subtitleData = await fetch(x.url).then(x => x.text());
        const subtitlePath = path.join(this._syncPath, `${i}.${x.language}.srt`);
        await fs.writeFile(subtitlePath, subtitle.stringifySync(subtitle.parseSync(subtitleData), {format: 'SRT'}));
        return Object.assign(x, {subtitlePath});
      } else {
        const subtitleData = await fetch(x.url).then(x => x.text());
        const subtitlePath = path.join(this._syncPath, `${i}.${x.language}.${x.type}`);
        await fs.writeFile(subtitlePath, subtitleData);
        return Object.assign(x, {subtitlePath});
      }
    }));
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
