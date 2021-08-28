import * as app from '..';
import * as ncm from '@nestjs/common';
import childProcess from 'child_process';
import crypto from 'crypto';
import fetch from 'node-fetch';
import path from 'path';
import which from 'which';

export class Runner {
  private readonly fileService: app.FileService;
  private readonly loggerService: app.LoggerService;
  private readonly remoteService: app.RemoteService;
  private readonly syncPath: string;

  constructor(fileService: app.FileService, loggerService: app.LoggerService, remoteService: app.RemoteService) {
    this.fileService = fileService;
    this.loggerService = loggerService;
    this.remoteService = remoteService;
    this.syncPath = path.join(app.settings.path.sync, Date.now().toString(16) + crypto.randomBytes(24).toString('hex'));
  }

  async runAsync(filePath: string, incompletePath: string, url: string) {
    const stream = await this.remoteService.streamAsync({url});
    if (stream.error) {
      throw new ncm.HttpException(stream.error.message, stream.statusCode);
    } else if (stream.value) try {
      await this.saveAsync(filePath, incompletePath, stream.value);
    } finally {
      await this.fileService.deleteAsync(this.syncPath);
    }
  }
  
  private async fetchAsync(subtitle: app.api.RemoteStreamSubtitle, subtitleIndex: number) {
    const filePath = path.join(this.syncPath, `${subtitleIndex}.${subtitle.language}.${subtitle.type}`);
    await this.fileService.writeAsync(filePath, await fetch(subtitle.url).then(x => x.buffer()));
    const language = ffmpegLanguages[subtitle.language];
    return {language, filePath};
  }

  private async saveAsync(filePath: string, incompletePath: string, stream: app.api.RemoteStream) {
    const foreignSubtitles = stream.subtitles
      .filter(x => x.language !== 'en-US')
      .sort((a, b) => a.language.localeCompare(b.language));
    const sortedSubtitles = await Promise.all(stream.subtitles
      .filter(x => x.language === 'en-US')
      .concat(foreignSubtitles)
      .map((x, i) => this.fetchAsync(x, i)));
    const inputs = [['-i', stream.sources[0].url]]
      .concat(sortedSubtitles.map(x => (['-i', x.filePath])))
      .flatMap(x => x);
    const mappings = [['-map', '0:v:0', '-map', '0:a:0']]
      .concat(sortedSubtitles.map((_, i) => ['-map', String(i + 1)]))
      .flatMap(x => x);
    const metadata = sortedSubtitles
      .map((x, i) => [`-metadata:s:s:${i}`, `language=${x.language}`])
      .flatMap(x => x);
    await this.spawnAsync(await ffmpegAsync(), ['-y']
      .concat(inputs)
      .concat(mappings)
      .concat(metadata)
      .concat(['-c', 'copy', '-f', 'matroska', incompletePath]));
    await this.fileService.renameAsync(incompletePath, filePath).catch(() => {});
  }

  private async spawnAsync(command: string, args: Array<string>) {
    this.loggerService.debug(`spawn ${command} ${JSON.stringify(args)}`);
    return await new Promise<void>((resolve, reject) => {
      const process = childProcess.spawn(command, args);
      process.stdout.on('data', (chunk: Buffer) => this.loggerService.debug(chunk.toString().trim()));
      process.stderr.on('data', (chunk: Buffer) => this.loggerService.debug(chunk.toString().trim()));
      process.on('error', (error) => reject(error));
      process.on('exit', (exitCode) => exitCode ? reject() : resolve());
    });
  }
}

async function ffmpegAsync() {
  const ffmpeg = await which('ffmpeg').catch(() => path.join(__dirname, '../../../../static/ffmpeg'));
  return app.settings.core.ffmpeg ?? ffmpeg;
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
