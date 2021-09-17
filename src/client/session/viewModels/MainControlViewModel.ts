import * as app from '..';
import * as mobx from 'mobx';

export class MainControlViewModel {
  private readonly navigator: app.INavigator;
  private readonly player: app.Renderer;
  private seekTimeout?: NodeJS.Timeout;

  constructor(navigator: app.INavigator, player: app.Renderer, subtitles: Array<app.ISubtitle>) {
    mobx.makeObservable(this);
    this.navigator = navigator;
    this.player = player;
    this.subtitle = new app.MainControlSubtitleViewModel(this.player, subtitles);
  }
  
  @mobx.action
  attach() {
    mediaSessionAttach(this);
    this.subtitle.attach();
    this.player.video.addEventListener('error'         , () => this.isSeeking = true)
    this.player.video.addEventListener('load'          , () => this.isSeeking = true);
    this.player.video.addEventListener('loadedmetadata', () => this.currentDuration = this.player.video.duration);
    this.player.video.addEventListener('playing'       , () => this.isPlaying = true);
    this.player.video.addEventListener('progress'      , () => this.currentBuffer = fetchBuffer(this.player.video));
    this.player.video.addEventListener('pause'         , () => this.isPlaying = false);
    this.player.video.addEventListener('seeking'       , () => this.isSeeking = false);
    this.player.video.addEventListener('timeupdate'    , () => this.currentTime = this.isSeeking ? this.currentTime : this.player.video.currentTime);
    this.player.video.addEventListener('waiting'       , () => this.currentTime = this.isSeeking ? this.currentTime : this.player.video.currentTime);
  }

  @mobx.action
  detach() {
    mediaSessionDetach();
    this.removeSchedule();
  }

  @mobx.action
  openNext() {
    if (!this.hasNext) return;
    this.navigator.openNext();
  }
  
  @mobx.action
  openPrevious() {
    if (!this.hasPrevious) return;
    this.navigator.openPrevious();
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
      this.player.video.pause();
    } else {
      this.player.video.play();
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
  subtitle: app.MainControlSubtitleViewModel;

  @mobx.action
  private removeSchedule() {
    if (!this.seekTimeout) return;
    clearTimeout(this.seekTimeout);
  }

  @mobx.action
  private schedule() {
    this.removeSchedule();
    this.seekTimeout = setTimeout(() => this.player.video.currentTime = this.currentTime, app.settings.seekTimeout);
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

function mediaSessionAttach(control: app.MainControlViewModel) {
  navigator.mediaSession.metadata = new MediaMetadata({title: control.titlePrimary, artist: control.titleSecondary});
  navigator.mediaSession.setActionHandler('previoustrack', control.hasPrevious ? () => control.openPrevious() : null);
  navigator.mediaSession.setActionHandler('nexttrack', control.hasNext ? () => control.openNext() : null);
  navigator.mediaSession.setActionHandler('seekbackward', () => control.seekBackward());
  navigator.mediaSession.setActionHandler('seekforward', () => control.seekForward());
}

function mediaSessionDetach() {
  navigator.mediaSession.metadata = null;
  navigator.mediaSession.setActionHandler('previoustrack', null);
  navigator.mediaSession.setActionHandler('nexttrack', null);
  navigator.mediaSession.setActionHandler('seekbackward', null);
  navigator.mediaSession.setActionHandler('seekforward', null);
}
