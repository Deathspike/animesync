import * as app from '..';
import * as ncm from '@nestjs/common';
import crypto from 'crypto';
import fetch from 'node-fetch';
import path from 'path';

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

  async runAsync(filePath: string, incompletePath: string, subtitlePath: string, url: string) {
    const stream = await this.remoteService.streamAsync({url});
    if (stream.error) {
      throw new ncm.HttpException(stream.error.message, stream.statusCode);
    } else if (stream.value) try {
      await this.saveAsync(filePath, incompletePath, subtitlePath, stream.value);
    } finally {
      await this.fileService.deleteAsync(this.syncPath);
    }
  }

  private async saveAsync(filePath: string, incompletePath: string, subtitlePath: string, stream: app.api.RemoteStream) {
    const mappedSubtitles = stream.subtitles
      .sort((a, b) => a.language.localeCompare(b.language))
      .map(x => ({...x, language: ffmpegLanguages[x.language]}));
    const sortedSubtitles = await Promise.all(mappedSubtitles
      .filter(x => x.language === 'eng')
      .concat(mappedSubtitles.filter(x => x.language !== 'eng'))
      .map((x, i) => this.subtitleAsync(i, x.language, x.type, x.url)));
    const inputs = [['-i', stream.sources[0].url]]
      .concat(sortedSubtitles.map(x => (['-i', x.filePath])))
      .flatMap(x => x);
    const mappings = [['-map', '0:v:0', '-map', '0:a:0']]
      .concat(sortedSubtitles.map((_, i) => ['-map', String(i + 1)]))
      .flatMap(x => x);
    const metadata = sortedSubtitles
      .map((x, i) => [`-metadata:s:s:${i}`, `language=${x.language}`])
      .flatMap(x => x);
    const runnable = ['-y']
      .concat(inputs)
      .concat(mappings)
      .concat(metadata)
      .concat(['-c', 'copy', '-f', 'matroska', incompletePath]);
    if (await app.ffmpegAsync(runnable, (chunk) => this.loggerService.debug(chunk.toString()))) {
      throw new Error();
    } else {
      const bundler = new app.SubtitleBundler(this.fileService, this.syncPath);
      await bundler.runAsync(subtitlePath);
      await this.fileService.renameAsync(incompletePath, filePath);
    }
  }

  private async subtitleAsync(index: number, language: string, type: string, url: string) {
    const filePath = path.join(this.syncPath, `${index}.${language}.${type}`);
    const value = await fetch(url).then(x => x.buffer());
    await this.fileService.writeAsync(filePath, value);
    return {filePath, language};
  }
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
