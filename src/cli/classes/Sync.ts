import * as app from '../..';
import * as sub from 'subtitle';
import childProcess from 'child_process';
import crypto from 'crypto';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';

export class Sync {
  private readonly _api: app.Server;
  private readonly _episodePath: string;
  private readonly _syncPath: string;

  constructor(api: app.Server, episodePath: string) {
    this._api = api;
    this._episodePath = episodePath;
    this._syncPath = path.join(app.settings.sync, Date.now().toString(16) + crypto.randomBytes(24).toString('hex'));
  }

  async saveAsync(stream: app.api.RemoteStream) {
    try {
      const allSubtitles = await this._prepareAsync(stream);
      const foreignSubtitles = allSubtitles
        .filter(x => x.language !== 'eng')
        .sort((a, b) => a.language.localeCompare(b.language));
      const sortedSubtitles = allSubtitles
        .filter(x => x.language === 'eng')
        .concat(foreignSubtitles);
      const inputs = [['-i', stream.url]]
        .concat(sortedSubtitles.map(x => (['-i', x.subtitlePath])))
        .reduce((p, c) => p.concat(c))
      const mappings = [['-map', '0:v', '-map', '0:a']]
        .concat(sortedSubtitles.map((_, i) => ['-map', String(i + 1)]))
        .reduce((p, c) => p.concat(c));
      const metadata = sortedSubtitles
        .map((x, i) => [`-metadata:s:s:${i}`, `language=${x.language}`])
        .reduce((p, c) => p.concat(c));
      await fs.ensureDir(path.dirname(this._episodePath));
      await this._spawnAsync(ffmpeg(), ['-y']
        .concat(inputs)
        .concat(mappings)
        .concat(['-metadata:s:a:0', 'language=jpn'])
        .concat(metadata)
        .concat(['-c', 'copy', this._episodePath]));
    } finally {
      await fs.remove(this._syncPath);
    }
  }

  private async _prepareAsync(stream: app.api.RemoteStream) {
    await fs.ensureDir(this._syncPath);
    return await Promise.all(stream.subtitles.map(async (subtitle, i) => {
      if (subtitle.type === 'vtt') {
        const subtitleData = await fetch(subtitle.url).then(x => x.text());
        const subtitlePath = path.join(this._syncPath, `${i}.${subtitle.language}.srt`);
        await fs.writeFile(subtitlePath, sub.stringifySync(sub.parseSync(subtitleData), {format: 'SRT'}));
        return Object.assign(subtitle, {subtitlePath});
      } else {
        const subtitleData = await fetch(subtitle.url).then(x => x.text());
        const subtitlePath = path.join(this._syncPath, `${i}.${subtitle.language}.${subtitle.type}`);
        await fs.writeFile(subtitlePath, subtitleData);
        return Object.assign(subtitle, {subtitlePath});
      }
    }));
  }

  async _spawnAsync(command: string, args: Array<string>) {
    this._api.logger.debug(`spawn ${command} ${JSON.stringify(args)}`);
    return await new Promise<void>((resolve, reject) => {
      const process = childProcess.spawn(command, args);
      process.stdout.on('data', (chunk: Buffer) => this._api.logger.debug(chunk.toString('utf-8').trim()));
      process.stderr.on('data', (chunk: Buffer) => this._api.logger.debug(chunk.toString('utf-8').trim()));
      process.on('error', reject);
      process.on('exit', resolve);
    });
  }  
}

function ffmpeg() {
  switch (process.platform) {
    case 'darwin':
      return path.join(__dirname, '../../../static/ffmpeg');
    case 'linux':
      return path.join(__dirname, '../../../static/ffmpeg');
    case 'win32':
      return path.join(__dirname, '../../../static/ffmpeg.exe');
    default:
      return 'ffmpeg';
  }
}
