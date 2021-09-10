import * as app from '..';
import * as mobx from 'mobx';
import {language} from '../language';
const sourceKey = 'preferredSource';

export class MainControlSourceViewModel implements app.IVideoHandler, app.IViewHandler {
  constructor(private readonly bridge: app.Bridge) {
    mobx.makeObservable(this);
  }

  @mobx.action
  select(source: app.ISource) {
    if (!this.canSelect || this.selectedSource === source) return;
    app.core.store.set(sourceKey, source.resolutionY);
    this.loadSource(source);
  }

  @mobx.action
  onVideoEvent(event: app.VideoEvent) {
    switch (event.type) {
      case 'loadedmetadata':
        this.isLoading = false;
        this.bridge.dispatchRequest({type: 'seek', time: this.currentTime});
        break;
      case 'seeking':
        this.currentTime = event.time;
        break;
      case 'timeupdate':
        if (!this.isLoading) this.currentTime = event.time;
        break;
    }
  }

  @mobx.action
  onVideoRequest(request: app.VideoRequest) {
    switch (request.type) {
      case 'sources':
        if (request.time) this.currentTime = request.time;
        this.sources = request.sources.map(x => ({...x, displayName: getDisplayName(x)})).sort((a, b) => (b.resolutionY ?? 0) - (a.resolutionY ?? 0));
        this.detectSource();
        break;
    }
  }
  
  @mobx.action
  onViewMount() {
    this.bridge.subscribe(this);
  }

  @mobx.action
  onViewUnmount() {
    this.bridge.unsubscribe(this);
  }

  @mobx.computed
  get canSelect() {
    return this.sources.length > 1;
  }

  @mobx.observable
  currentTime = 0;

  @mobx.observable
  isLoading = true;

  @mobx.observable
  selectedSource?: app.ISource;

  @mobx.observable
  sources: Array<app.ISource> = [];

  @mobx.action
  private detectSource() {
    const preferred = app.core.store.getNumber(sourceKey, 1080);
    const source = this.sources.filter(x => x.resolutionY && x.resolutionY <= preferred)[0] ?? this.sources[0];
    this.loadSource(source);
  }

  @mobx.action
  private loadSource(source: app.ISource) {
    this.isLoading = true;
    this.selectedSource = source;
    this.bridge.dispatchRequest({type: 'loadSource', source});
  }
}

function getDisplayName(source: app.ISource) {
  if (source.resolutionY) {
    return `${source.resolutionY}p`;
  } else {
    return language.source;
  }
}
