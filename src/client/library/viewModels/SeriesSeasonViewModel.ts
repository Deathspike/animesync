import * as app from '..';
import * as mobx from 'mobx';

export class SeriesSeasonViewModel {
  private readonly season: app.api.LibrarySeriesSeason;

  constructor(season: app.api.LibrarySeriesSeason) {
    mobx.makeObservable(this);
    this.season = season;
  }

  @mobx.computed
  get episodes() {
    return this.season.episodes.map(x => new app.SeriesSeasonEpisodeViewModel(x));
  }

  @mobx.computed
  get id() {
    return this.season.id;
  }
  
  @mobx.computed
  get title() {
    return this.season.title;
  }
}
