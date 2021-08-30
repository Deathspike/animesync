import * as app from '..';
import * as ncm from '@nestjs/common';

@ncm.Injectable()
export class SubtitleService implements ncm.OnModuleInit {
  private readonly fileService: app.FileService;
  private readonly libraryService: app.LibraryService;
  private readonly loggerService: app.LoggerService;

  constructor(fileService: app.FileService, libraryService: app.LibraryService, loggerService: app.LoggerService) {
    this.fileService = fileService;
    this.libraryService = libraryService;
    this.loggerService = loggerService;
  }

  onModuleInit() {
    this.subtitlesAsync()
      .then(() => this.loggerService.debug('[SubtitleService] Completed successfully'))
      .catch((error) => this.loggerService.error(error));
  }

  private async subtitlesAsync() {
    const context = await this.libraryService.contextAsync();
    const seriesPaths = context.series.map(x => x.path);
    for (const seriesPath of seriesPaths) {
      const series = await this.libraryService.seriesAsync(seriesPath);
      const episodes = series.seasons.flatMap(x => x.episodes).filter(x => x.available);
      for (const episode of episodes) {
        if (await this.fileService.existsAsync(`${episode.path}.zip`)) continue;
        this.loggerService.debug(`[SubtitleService] ${episode.path}`);
        await this.libraryService.episodeSubtitleAsync(episode.path);
      }
    }
  }
}
