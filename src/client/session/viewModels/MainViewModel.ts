import * as app from '..';
import * as mobx from 'mobx';

export class MainViewModel {
  private readonly navigator: app.INavigator;
  private readonly player: app.Renderer;
  private clickTimeout?: number;
  private hideTimeout?: NodeJS.Timeout;

  constructor(navigator: app.INavigator, player: app.Renderer, subtitles: Array<app.ISubtitle>) {
    mobx.makeObservable(this);
    this.control = new app.MainControlViewModel(navigator, player, subtitles);
    this.navigator = navigator;
    this.player = player;
  }

  @mobx.action
  attach() {
    app.core.input.subscribe(this);
    this.control.attach();
    this.player.video.addEventListener('ended', () => this.navigator.openNext());
    this.player.video.addEventListener('loadedmetadata', () => this.isWaiting = false);
    this.player.video.addEventListener('play', () => this.isWaiting = false);
    this.player.video.addEventListener('playing', () => this.schedule());
    this.player.video.addEventListener('pause', () => this.schedule());
    this.player.video.addEventListener('seeked', () => this.isWaiting = false);
    this.player.video.addEventListener('seeking', () => this.isWaiting = true);
    this.player.video.addEventListener('waiting', () => this.isWaiting = true);
  }

  @mobx.action
  detach() {
    this.control.detach();
    this.removeSchedule();
    app.core.input.unsubscribe(this);
  }
  
  @mobx.action
  onInputKey(event: app.InputKeyEvent) {
    if (event.type !== 'backspace') {
      this.schedule();
      return false;
    } else if (this.isHidden) {
      this.schedule();
      return true;
    } else {
      app.core.browser.goBack();
      return true;
    }
  }

  @mobx.action
  onInputMouse(event: app.InputMouseEvent) {
    if (this.isHidden && event.type === 'down') {
      this.onVideoClick();
      return true;
    } else {
      this.schedule();
      return false;
    }
  }

  @mobx.action
  onVideoClick() {
    if (this.clickTimeout && this.clickTimeout >= Date.now()) {
      app.core.screen.toggleFullscreen();
      this.control.togglePlay();
      delete this.clickTimeout;
    } else {
      this.clickTimeout = Date.now() + app.settings.clickTimeout;
      this.control.togglePlay();
    }
  }

  @mobx.observable
  control: app.MainControlViewModel;
  
  @mobx.observable
  isHidden = false;

  @mobx.observable
  isWaiting = true;

  @mobx.action
  private removeHide() {
    this.isHidden = false;
  }

  @mobx.action
  private removeSchedule() {
    if (!this.hideTimeout) return;
    clearTimeout(this.hideTimeout);
  }

  @mobx.action
  private schedule() {
    this.removeHide();
    this.removeSchedule();
    this.hideTimeout = setTimeout(() => {
      if (!this.control.isPlaying || this.isWaiting) return;
      this.isHidden = true;
    }, app.settings.hideTimeout);
  }
}
