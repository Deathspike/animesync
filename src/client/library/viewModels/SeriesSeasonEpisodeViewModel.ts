import * as app from '..';
import * as mobx from 'mobx';

export class SeriesSeasonEpisodeViewModel {
  private readonly episode: app.api.LibrarySeriesSeasonEpisode;

  constructor(episode: app.api.LibrarySeriesSeasonEpisode) {
    mobx.makeObservable(this);
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
    return this.episode.available && this.episode.id + '/';
  }
}
