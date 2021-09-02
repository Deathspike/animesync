import * as app from '..';
import * as mobx from 'mobx';
const api = app.core.server;

export class MainViewModel {
  constructor() {
    mobx.makeObservable(this);
  }

  @mobx.action
  async refreshAsync() {
    const context = await api.library.contextAsync();
    if (context.value) {
      this.series = context.value.series.map(x => new app.SeriesViewModel(x));
      this.isLoaded = true;
    } else {
      // TODO: Handle error.
    }
  }
  
  @mobx.observable
  isLoaded = false;

  @mobx.observable
  series = [] as Array<app.SeriesViewModel>;
}
