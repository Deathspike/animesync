import * as app from '..';
import * as mobx from 'mobx';
const api = app.core.server;

export class MainViewModel {
  constructor(seriesId: string) {
    mobx.makeObservable(this);
    this.seriesId = seriesId;
  }

  @mobx.action
  async refreshAsync() {
    const series = await api.library.seriesAsync(this);
    if (series.value) {
      console.log(series.value);
      this.isLoaded = true;
    } else if (series.statusCode === 404) {
      location.replace( new URL('..', location.href).toString());
    } else {
      // TODO: Handle error.
    }
  }

  @mobx.observable
  isLoaded = false;

  @mobx.observable
  seriesId: string;
}
