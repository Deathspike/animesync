import * as app from '..';
import * as mobx from 'mobx';

export class SeriesViewModel {
  constructor(series: app.api.LibraryContextSeries) {
    this.id = series.id;
    this.title = series.title;
    this.url = series.id + '/';
  }

  @mobx.observable
  id: string;

  @mobx.observable
  title: string;

  @mobx.observable
  url: string;
}
