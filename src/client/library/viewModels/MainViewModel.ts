import * as app from '..';
import * as mobx from 'mobx';

export class MainViewModel {
  constructor() {
    mobx.makeObservable(this);
  }

  @mobx.action
  async refreshAsync() {
    const context = await app.server.library.contextAsync();
    if (context.value) {
      this.series = context.value.series.map(x => new app.MainSeriesViewModel(x));
    } else {
      // Handle error.
    }
  }

  @mobx.observable
  series = new Array<app.MainSeriesViewModel>();
}
