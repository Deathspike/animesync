import * as app from '..';
import * as mobx from 'mobx';

export class NavigatorEpisode implements app.session.INavigatorEpisode {
  private readonly series: app.api.LibrarySeries;
  private readonly season: app.api.LibrarySeriesSeason;
  private readonly episode: app.api.LibrarySeriesSeasonEpisode;

  constructor(series: app.api.LibrarySeries, season: app.api.LibrarySeriesSeason, episode: app.api.LibrarySeriesSeasonEpisode) {
    mobx.makeObservable(this);
    this.series = series;
    this.season = season;
    this.episode = episode;
  }

  @mobx.computed
  get id() {
    return this.episode.id;
  }

  @mobx.computed
  get seriesName() {
    return this.series.title;
  }

  @mobx.computed
  get seasonName() {
    return this.season.title;
  }

  @mobx.computed
  get episodeName() {
    return this.episode.episode.toString();
  }

  @mobx.computed
  get episodeTitle() {
    return this.episode.title;
  }
}
