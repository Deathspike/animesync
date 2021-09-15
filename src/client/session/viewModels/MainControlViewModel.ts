import * as app from '..';
import * as mobx from 'mobx';

export class MainControlViewModel {
  private seekTimeout?: NodeJS.Timeout;

  constructor(private readonly navigator: app.INavigator, private readonly renderer: app.Renderer) {
    mobx.makeObservable(this);  
  }
  
  @mobx.action
  onViewMount() {
    this.renderer.video.addEventListener('error'         , () => this.isSeeking = true)
    this.renderer.video.addEventListener('load'          , () => this.isSeeking = true);
    this.renderer.video.addEventListener('loadedmetadata', () => this.currentDuration = this.renderer.video.duration);
    this.renderer.video.addEventListener('playing'       , () => this.isPlaying = true);
    this.renderer.video.addEventListener('progress'      , () => this.currentDuration = fetchBuffer(this.renderer.video));
    this.renderer.video.addEventListener('pause'         , () => this.isPlaying = false);
    this.renderer.video.addEventListener('seeking'       , () => this.isSeeking = false);
    this.renderer.video.addEventListener('timeupdate'    , () => this.currentTime = this.isSeeking ? this.currentTime : this.renderer.video.currentTime);
    this.renderer.video.addEventListener('waiting'       , () => this.currentTime = this.isSeeking ? this.currentTime : this.renderer.video.currentTime);
  }

  @mobx.action
  onViewUnmount() {
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
    if (!this.isLoaded) {
      return;
    } else if (this.isPlaying) {
      this.renderer.video.pause();
    } else {
      this.renderer.video.play();
    }
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
  isPlaying = false;

  @mobx.observable
  isSeeking = false;

  @mobx.observable
  readonly subtitle = new app.MainControlSubtitleViewModel(this.renderer, this.subtitles);

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

function fetchBuffer(player: HTMLVideoElement) {
  for (let i = 0; i < player.buffered.length; i++) {
    if (player.currentTime < player.buffered.start(i)) continue;
    if (player.currentTime > player.buffered.end(i)) continue;
    return Math.floor(player.buffered.end(i));
  }
  return 0;
}
