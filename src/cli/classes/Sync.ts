import * as app from '../..';
import * as sub from 'subtitle';
import childProcess from 'child_process';
import crypto from 'crypto';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';

export class Sync {
  private readonly api: app.Server;
  private readonly episodePath: string;
  private readonly syncPath: string;

  constructor(api: app.Server, episodePath: string) {
    this.api = api;
    this.episodePath = episodePath;
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
        .concat(sortedSubtitles.map(x => (['-i', x.filePath])))
        .reduce((p, c) => p.concat(c), [])
      const mappings = [['-map', '0:v', '-map', '0:a']]
        .concat(sortedSubtitles.map((_, i) => ['-map', String(i + 1)]))
        .reduce((p, c) => p.concat(c), []);
      const metadata = sortedSubtitles
        .map((x, i) => [`-metadata:s:s:${i}`, `language=${x.language}`])
        .reduce((p, c) => p.concat(c), []);
      await fs.ensureDir(path.dirname(this.episodePath));
      await this.spawnAsync(ffmpeg(), ['-y']
        .concat(inputs)
        .concat(mappings)
        .concat(metadata)
        .concat(['-c', 'copy', this.episodePath]));
    } finally {
      await fs.remove(this.syncPath);
    }
  }

  private localSubtitle(subtitle: app.api.RemoteStreamSubtitle, filePath: string) {
    const language = translate(subtitle.language);
    const type = subtitle.type;
    const url = subtitle.url;
    return {filePath, language, type, url};
  }

  private async prepareAsync(stream: app.api.RemoteStream) {
    await fs.ensureDir(this.syncPath);
    return await Promise.all(stream.subtitles.map(async (subtitle, i) => {
      if (subtitle.type === 'vtt') {
        const subtitleData = await fetch(subtitle.url).then(x => x.text());
        const subtitlePath = path.join(this.syncPath, `${i}.${subtitle.language}.srt`);
        await fs.writeFile(subtitlePath, sub.stringifySync(sub.parseSync(subtitleData), {format: 'SRT'}));
        return this.localSubtitle(subtitle, subtitlePath);
      } else {
        const subtitleData = await fetch(subtitle.url).then(x => x.text());
        const subtitlePath = path.join(this.syncPath, `${i}.${subtitle.language}.${subtitle.type}`);
        await fs.writeFile(subtitlePath, subtitleData);
        return this.localSubtitle(subtitle, subtitlePath);
      }
    }));
  }
  
  private async spawnAsync(command: string, args: Array<string>) {
    this.api.logger.debug(`spawn ${command} ${JSON.stringify(args)}`);
    return await new Promise<void>((resolve, reject) => {
      const process = childProcess.spawn(command, args);
      process.stdout.on('data', (chunk: Buffer) => this.api.logger.debug(chunk.toString('utf-8').trim()));
      process.stderr.on('data', (chunk: Buffer) => this.api.logger.debug(chunk.toString('utf-8').trim()));
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

function translate(language: app.api.RemoteStreamSubtitle['language']) {
  switch (language) {
    case 'ar-ME': return 'ara';
    case 'de-DE': return 'ger';
    case 'en-US': return 'eng';
    case 'es-ES': return 'spa';
    case 'es-LA': return 'spa';
    case 'fr-FR': return 'fre';
    case 'it-IT': return 'ita';
    case 'pt-BR': return 'por';
    case 'ru-RU': return 'rus';
    case 'tr-TR': return 'tur';
    default: throw new Error();
  }
}
