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
      this.isLoaded = true;
    } else {
      // TODO: Handle error.
    }
  }
  
  @mobx.observable
  isLoaded = false;

  @mobx.observable
  series = [] as Array<app.MainSeriesViewModel>;
}
