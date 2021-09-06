import * as app from '..';
import * as mobx from 'mobx';

export class SeriesSeasonEpisodeViewModel {
  private readonly seriesId: string;
  private readonly episode: app.api.LibrarySeriesSeasonEpisode;

  constructor(seriesId: string, episode: app.api.LibrarySeriesSeasonEpisode) {
    mobx.makeObservable(this);
    this.seriesId = seriesId;
    this.episode = episode;
  }

  @mobx.computed
  get id() {
    return this.episode.id;
  }

  @mobx.computed
  get title() {
    const number = String(this.episode.episode).padStart(2, '0');
    const suffix = this.episode.title && ` - ${this.episode.title}`;
    return number + suffix;
  }

  @mobx.computed
  get url() {
    return this.episode.available && app.core.api.library.episodeUrl({seriesId: this.seriesId, episodeId: this.episode.id});
  }
}
