import * as app from '..';
import * as mobx from 'mobx';

export class MainControlViewModel implements app.IInputHandler, app.IVideoHandler, app.IViewHandler {
  private seekTimeout?: NodeJS.Timeout;

  constructor(
    private readonly bridge: app.Bridge,
    private readonly navigator: app.INavigator
  ) {}

  @mobx.action
  onInputKey(event: app.InputKeyEvent) {
    if (event.type === 'enter') {
      this.togglePlay();
      return true;
    } else if (event.type === 'arrowDown') {
      this.openPrevious();
      return true;
    } else if (event.type === 'arrowLeft') {
      this.seekBackward();
      return true;
    } else if (event.type === 'arrowRight') {
      this.seekForward();
      return true;
    } else if (event.type === 'arrowUp') {
      this.openNext();
      return true;
    } else {
      return false;
    }
  }
  
  @mobx.action
  onVideoEvent(event: app.VideoEvent) {
    switch (event.type) {
      case 'error':
        this.isSeeking = true;
        break;
      case 'loadedmetadata':
        this.currentDuration = event.duration;
        break;
      case 'playing':
        this.isPlaying = true;
        break;
      case 'progress':
        this.currentBuffer = event.buffer;
        break;
      case 'pause':
        this.isPlaying = false;
        break;
      case 'seeking':
        this.isSeeking = false;
        break;
      case 'timeupdate':
        if (!this.isSeeking) this.currentTime = event.time;
        break;
      case 'waiting':
        if (!this.isSeeking) this.currentTime = event.time;
        break;
    }
  }

  @mobx.action
  onVideoRequest(event: app.VideoRequest) {
    switch (event.type) {
      case 'loadSource':
        this.isSeeking = this.currentTime !== 0;
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
    this.removeSchedule();
  }

  @mobx.action
  openNext() {
    if (!this.hasNext) return;
    this.navigator.openNext(true);
  }
  
  @mobx.action
  openPrevious() {
    if (!this.hasPrevious) return;
    this.navigator.openPrevious(true);
  }

  @mobx.action
  seekBackward() {
    if (!this.isLoaded) return;
    this.currentTime = Math.max(this.currentTime - app.settings.seekBackward, 0);
    this.isSeeking = true;
    this.schedule();
  }

  @mobx.action
  seekForward() {
    if (!this.isLoaded) return;
    this.currentTime = Math.min(this.currentTime + app.settings.seekForward, this.currentDuration);
    this.isSeeking = true;
    this.schedule();
  }

  @mobx.action
  seekStart(time: number) {
    if (!this.isLoaded) return;
    this.currentTime = time;
    this.isSeeking = true;
    this.removeSchedule();
  }

  @mobx.action
  seekStop(time: number) {
    if (!this.isLoaded) return;
    this.currentTime = time;
    this.isSeeking = true;
    this.schedule();
  }

  @mobx.action
  togglePlay() {
    if (!this.isLoaded) return;
    this.isPlaying = !this.isPlaying;
    this.bridge.dispatchRequest(this.isPlaying ? {type: 'play'} : {type: 'pause'});
  }

  @mobx.computed
  get isLoaded() {
    return Boolean(this.currentDuration);
  }

  @mobx.computed
  get hasNext() {
    return this.navigator.hasNext;
  }

  @mobx.computed
  get hasPrevious() {
    return this.navigator.hasPrevious;
  }
  
  @mobx.computed
  get titlePrimary() {
    const current = this.navigator.current;
    const name = isFinite(parseFloat(current.episodeName))
      ? current.episodeName.padStart(2, '0')
      : current.episodeName;
    return current.episodeTitle
      ? `Episode ${name} - ${current.episodeTitle}`
      : `Episode ${name}`;
  }

  @mobx.computed
  get titleSecondary() {
    return this.navigator.current.seriesName === this.navigator.current.seasonName
      ? `${this.navigator.current.seriesName}`
      : `${this.navigator.current.seriesName} ● ${this.navigator.current.seasonName}`;
  }
  
  @mobx.observable
  currentBuffer = 0;

  @mobx.observable
  currentDuration = 0;

  @mobx.observable
  currentTime = 0;

  @mobx.observable
  isPlaying = true;

  @mobx.observable
  isSeeking = false;

  @mobx.observable
  readonly source = new app.MainControlSourceViewModel(this.bridge);

  @mobx.observable
  readonly subtitle = new app.MainControlSubtitleViewModel(this.bridge);

  @mobx.action
  private removeSchedule() {
    if (!this.seekTimeout) return;
    clearTimeout(this.seekTimeout);
  }

  @mobx.action
  private schedule() {
    this.removeSchedule();
    this.seekTimeout = setTimeout(() => {
      return this.currentTime < this.currentDuration
        ? this.bridge.dispatchRequest({type: 'seek', time: this.currentTime})
        : this.bridge.dispatchEvent({type: 'ended'});
    }, app.settings.seekTimeout);
  }
}
