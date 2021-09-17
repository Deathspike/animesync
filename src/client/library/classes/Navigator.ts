import * as app from '..';
import * as mobx from 'mobx';

export class Navigator implements app.session.INavigator {
  private readonly series: app.api.LibrarySeries;
  private readonly episodeId: string;

  constructor(series: app.api.LibrarySeries, episodeId: string) {
    mobx.makeObservable(this);
    this.series = series;
    this.episodeId = episodeId;
  }

  @mobx.computed
  get current() {
    return this.episodes[this.currentIndex];
  }

  @mobx.computed
  get currentIndex() {
    return this.episodes.findIndex(x => x.id === this.episodeId);
  }

  @mobx.computed
  get episodes() {
    return this.series.seasons
      .map(x => x.episodes.map(y => new app.NavigatorEpisode(this.series, x, y)))
      .flatMap(x => x);
  }

  @mobx.computed
  get hasNext() {
    return this.currentIndex < this.episodes.length - 1;  
  }

  @mobx.computed
  get hasPrevious() {
    return this.currentIndex > 0;
  }

  @mobx.action
  openNext() {
    if (this.hasNext) {
      const episodeId = this.episodes[this.currentIndex + 1].id;
      const url = new URL(`../${episodeId}/`, location.href);
      app.shared.core.browser.replace(url.pathname);
    } else {
      app.shared.core.browser.goBack();
    }
  }

  @mobx.action
  openPrevious() {
    if (this.hasPrevious) {
      const episodeId = this.episodes[this.currentIndex - 1].id;
      const url = new URL(`../${episodeId}/`, location.href);
      app.shared.core.browser.replace(url.pathname);
    } else {
      app.shared.core.browser.goBack();
    }
  }
}
