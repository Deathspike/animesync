import * as app from '..';
import * as mobx from 'mobx';
const api = app.shared.core.api;

export class MainViewModel {
  constructor() {
    mobx.makeObservable(this);
  }

  @mobx.action
  async refreshAsync() {
    const context = await api.library.contextAsync();
    if (context.value) {
      this.series = context.value.series.map(x => new app.MainSeriesViewModel(x));
    } else {
      // Handle error.
    }
  }

  @mobx.observable
  series = new Array<app.MainSeriesViewModel>();
}
