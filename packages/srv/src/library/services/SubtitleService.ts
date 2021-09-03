import * as app from '..';
import * as ncm from '@nestjs/common';

@ncm.Injectable()
export class SubtitleService implements ncm.OnModuleInit {
  private readonly libraryService: app.LibraryService;
  private readonly loggerService: app.LoggerService;

  constructor(libraryService: app.LibraryService, loggerService: app.LoggerService) {
    this.libraryService = libraryService;
    this.loggerService = loggerService;
  }

  onModuleInit() {
    this.subtitlesAsync().catch((error) => this.loggerService.error(error));
  }

  private async subtitlesAsync() {
    const context = await this.libraryService.contextAsync();
    const seriesPaths = context.series.map(x => x.path);
    for (const seriesPath of seriesPaths) {
      const series = await this.libraryService.seriesAsync(seriesPath);
      const episodes = series.seasons.flatMap(x => x.episodes).filter(x => x.available);
      for (const episode of episodes) await this.libraryService.episodeSubtitleAsync(episode.path);
    }
  }
}
