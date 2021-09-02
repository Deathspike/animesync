import * as app from '..';
import * as mobx from 'mobx';

export class MainSeriesViewModel {
  private readonly series: app.api.LibraryContextSeries;

  constructor(series: app.api.LibraryContextSeries) {
    mobx.makeObservable(this);
    this.series = series;
  }

  @mobx.computed
  get id() {
    return this.series.id;
  }

  @mobx.computed
  get title() {
    return this.series.title;
  }

  @mobx.computed
  get url() {
    return this.series.id + '/';
  }
}
