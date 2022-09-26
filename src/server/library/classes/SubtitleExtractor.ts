import * as app from '..';
import crypto from 'crypto';
import path from 'path';

export class SubtitleExtractor {
  private readonly fileService: app.FileService;
  private readonly loggerService: app.LoggerService;
  private readonly syncPath: string;

  constructor(fileService: app.FileService, loggerService: app.LoggerService) {
    this.fileService = fileService;
    this.loggerService = loggerService;
    this.syncPath = path.join(app.settings.path.sync, Date.now().toString(16) + crypto.randomBytes(24).toString('hex'));
  }

  async runAsync(filePath: string, subtitlePath: string) {
    try {
      const subtitles: Array<[string, string]> = [];
      await this.fileService.ensureAsync(this.syncPath);
      await this.matchAsync(filePath, subtitles);
      await this.saveAsync(filePath, subtitlePath, subtitles);
    } finally {
      await this.fileService.deleteAsync(this.syncPath);
    }
  }

  private async matchAsync(filePath: string, subtitles: Array<[string, string]>) {
    const expression = /Stream #0:([0-9]+)(?:\((.+)\))?: Subtitle: (ass|subrip)/gm;    
    const text = await this.textAsync(filePath);
    let match: RegExpMatchArray | null;
    while (match = expression.exec(text)) {
      const id = match[1];
      const language = match[2] ?? 'eng';
      const extension = match[3] === 'ass' ? 'ass' : 'srt';
      if (app.settings.core.filterSubtitles) {
        if (app.settings.core.filterSubtitles.find((lng => lng === language)) !== undefined) {
          subtitles.push([id, path.join(this.syncPath, `${path.parse(filePath).name}.${language}.${extension}`)]);
        }
      } else {
        subtitles.push([id, path.join(this.syncPath, `${path.parse(filePath).name}.${language}.${extension}`)]);
      }
    }
  }

  private async saveAsync(filePath: string, subtitlePath: string, subtitles: Array<[string, string]>) {
    const mappings = subtitles.map(([k, v]) => ['-map', `0:${k}`, v]).flatMap(x => x);
    const runnable = ['-y', '-i', filePath].concat(mappings);
    if (await app.ffmpegAsync(this.loggerService, runnable)) {
      throw new Error();
    } else {
      const bundler = new app.SubtitleBundler(this.fileService, this.syncPath);
      await bundler.runAsync(subtitlePath);
    }
  }
  
  private async textAsync(filePath: string) {
    const result: Array<Buffer> = [];
    await app.ffmpegAsync(this.loggerService, ['-y', '-i', filePath], (chunk) => result.push(chunk));
    return Buffer.concat(result).toString();
  }
}
