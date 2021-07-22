import * as app from '../..';
import childProcess from 'child_process';
import crypto from 'crypto';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';
import which from 'which';

export class Sync {
  private readonly api: app.Server;
  private readonly outputPath: string;
  private readonly syncPath: string;

  constructor(api: app.Server, outputPath: string) {
    this.api = api;
    this.outputPath = outputPath;
    this.syncPath = path.join(app.settings.path.sync, Date.now().toString(16) + crypto.randomBytes(24).toString('hex'));
  }

  async saveAsync(stream: app.api.RemoteStream) {
    try {
      const allSubtitles = await this.prepareAsync(stream);
      const foreignSubtitles = allSubtitles
        .filter(x => x.language !== 'eng')
        .sort((a, b) => a.language.localeCompare(b.language));
      const sortedSubtitles = allSubtitles
        .filter(x => x.language === 'eng')
        .concat(foreignSubtitles);
      const inputs = [['-i', stream.sources[0].url]]
        .concat(sortedSubtitles.map(x => (['-i', x.subtitlePath])))
        .reduce((p, c) => p.concat(c), [])
      const mappings = [['-map', '0:v:0', '-map', '0:a:0']]
        .concat(sortedSubtitles.map((_, i) => ['-map', String(i + 1)]))
        .reduce((p, c) => p.concat(c), []);
      const metadata = sortedSubtitles
        .map((x, i) => [`-metadata:s:s:${i}`, `language=${x.language}`])
        .reduce((p, c) => p.concat(c), []);
      await fs.ensureDir(path.dirname(this.outputPath));
      await this.spawnAsync(await findAsync(), ['-y']
        .concat(inputs)
        .concat(mappings)
        .concat(metadata)
        .concat(['-c', 'copy', this.outputPath]));
    } finally {
      await fs.remove(this.syncPath);
    }
  }

  private async prepareAsync(stream: app.api.RemoteStream) {
    await fs.ensureDir(this.syncPath);
    return stream.subtitles.reduce((p, subtitle, i) => p.then(async (results) => {
      const language = ffmpegLanguages[subtitle.language];
      const subtitlePath = path.join(this.syncPath, `${i}.${subtitle.language}.${subtitle.type}`);
      await fs.writeFile(subtitlePath, await fetch(subtitle.url).then(x => x.buffer()));
      return results.concat({language, subtitlePath});
    }), Promise.resolve<Array<{language: string, subtitlePath: string}>>([]));
  }
  
  private async spawnAsync(command: string, args: Array<string>) {
    this.api.logger.debug(`spawn ${command} ${JSON.stringify(args)}`);
    return await new Promise<void>((resolve, reject) => {
      const process = childProcess.spawn(command, args);
      process.stdout.on('data', (chunk: Buffer) => this.api.logger.debug(chunk.toString('utf-8').trim()));
      process.stderr.on('data', (chunk: Buffer) => this.api.logger.debug(chunk.toString('utf-8').trim()));
      process.on('error', reject);
      process.on('exit', (exitCode) => {
        if (exitCode === 0) return resolve();
        this.api.logger.error(`Unexpected exit code: ${exitCode}`);
        reject();
      });
    });
  }
}

async function findAsync() {
  return app.settings.core.ffmpeg
    ? app.settings.core.ffmpeg
    : await which('ffmpeg').catch(() => path.join(__dirname, '../../../static/ffmpeg'));
}

const ffmpegLanguages = {
  'ar-ME': 'ara',
  'de-DE': 'ger',
  'en-US': 'eng',
  'es-ES': 'spa',
  'es-LA': 'spa',
  'fr-FR': 'fre',
  'it-IT': 'ita',
  'pt-BR': 'por',
  'ru-RU': 'rus',
  'tr-TR': 'tur'
};
