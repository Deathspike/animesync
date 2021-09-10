import * as app from '..';
import * as mobx from 'mobx';
const api = app.shared.core.api;

class NavigatorEpisode implements app.session.INavigatorEpisode {
  private readonly series: app.api.LibrarySeries;
  private readonly season: app.api.LibrarySeriesSeason;
  private readonly episode: app.api.LibrarySeriesSeasonEpisode;

  constructor(series: app.api.LibrarySeries, season: app.api.LibrarySeriesSeason, episode: app.api.LibrarySeriesSeasonEpisode) {
    mobx.makeObservable(this);
    this.series = series;
    this.season = season;
    this.episode = episode;
  }

  @mobx.computed
  get id() {
    return this.episode.id;
  }

  @mobx.computed
  get seriesName() {
    return this.series.title;
  }

  @mobx.computed
  get seasonName() {
    return this.season.title;
  }

  @mobx.computed
  get episodeName() {
    return this.episode.episode.toString();
  }

  @mobx.computed
  get episodeTitle() {
    return this.episode.title;
  }
}

class Navigator implements app.session.INavigator {
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
      .map(x => x.episodes.map(y => new NavigatorEpisode(this.series, x, y)))
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
    if (!this.hasNext) return;
    // TODO:
  }

  @mobx.action
  openPrevious() {
    if (!this.hasPrevious) return;
    // TODO:
  }

  @mobx.action
  preloadNext() {
    return;
  }
}

export class WatchViewModel {
  private readonly seriesId: string;
  private readonly episodeId: string;
  
  constructor(seriesId: string, episodeId: string) {
    mobx.makeObservable(this);
    this.seriesId = seriesId;
    this.episodeId = episodeId;
  }

  @mobx.action
  async refreshAsync() {
    const series = await api.library.seriesAsync({seriesId: this.seriesId});
    if (series.value) {
      const navigator = new Navigator(series.value, this.episodeId);
      const url = api.library.episodeUrl({seriesId: this.seriesId, episodeId: this.episodeId});

      console.log('setting session');
      this.session = new app.session.MainViewModel(navigator);

      setTimeout(() => {
        // LOL
        this.session!.bridge.dispatchRequest({type: 'loadSource', source: {urls: [url], type: 'src'}});
      }, 250);

    } else if (series.statusCode === 404) {
      // Handle not found.
    } else {
      // Handle error.
    }
  }

  @mobx.observable
  session?: app.session.MainViewModel = undefined;
}
