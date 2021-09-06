import * as app from '..';
import * as mobx from 'mobx';

export class SeriesViewModel {
  private readonly seriesId: string;
  
  constructor(seriesId: string) {
    mobx.makeObservable(this);
    this.seriesId = seriesId;
  }

  @mobx.action
  async refreshAsync() {
    const series = await app.core.api.library.seriesAsync({seriesId: this.seriesId});
    if (series.value) {
      this.seasons = series.value.seasons.map(x => new app.SeriesSeasonViewModel(this.seriesId, x));
      this.title = series.value.title;
    } else if (series.statusCode === 404) {
      // Handle not found.
    } else {
      // Handle error.
    }
  }

  @mobx.observable
  seasons = new Array<app.SeriesSeasonViewModel>();

  @mobx.observable
  title = '';
}
