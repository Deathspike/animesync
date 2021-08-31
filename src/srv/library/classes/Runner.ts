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
    const subtitles = await Promise.all(stream.subtitles
      .filter(x => x.language === 'eng')
      .concat(stream.subtitles.filter(x => x.language !== 'eng').sort((a, b) => a.language.localeCompare(b.language)))
      .map(x => this.subtitleAsync(filePath, x.language, x.type, x.url)));
    const inputs = [['-i', stream.sources[0].url]]
      .concat(subtitles.map(x => (['-i', x.subtitlePath])))
      .flatMap(x => x);
    const mappings = [['-map', '0:v:0', '-map', '0:a:0']]
      .concat(subtitles.map((_, i) => ['-map', String(i + 1)]))
      .flatMap(x => x);
    const metadata = subtitles
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

  private async subtitleAsync(filePath: string, language: string, type: string, url: string) {
    const subtitlePath = path.join(this.syncPath, `${path.parse(filePath).name}.${language}.${type}`);
    const value = await fetch(url).then(x => x.buffer());
    await this.fileService.writeAsync(subtitlePath, value);
    return {subtitlePath, language};
  }
}
