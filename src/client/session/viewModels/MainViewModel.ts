import * as app from '..';
import * as mobx from 'mobx';

export class MainViewModel implements app.IInputHandler, app.IVideoHandler, app.IViewHandler {
  private clickTimeout?: number;
  private hideTimeout?: NodeJS.Timeout;

  constructor(private readonly navigator: app.INavigator) {
    mobx.makeObservable(this);
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

  @mobx.action
  onVideoEvent(event: app.VideoEvent) {
    switch (event.type) {
      case 'ended':
        if (this.navigator.hasNext) this.navigator.openNext(false);
        else app.core.browser.goBack();
        break;
      case 'loadedmetadata':
        this.isWaiting = false;
        break;
      case 'playing':
        this.isWaiting = false;
        this.schedule();
        break;
      case 'pause':
        this.schedule();
        break;
      case 'seeked':
        this.isWaiting = false;
        break;
      case 'seeking':
        this.isWaiting = true;
        break;
      case 'timeupdate':
        if (!event.duration || event.duration - event.time > app.settings.preloadTreshold) break;
        this.navigator.preloadNext();
        break;
      case 'waiting':
        this.isWaiting = true;
        break;
    }
  }

  @mobx.action
  onVideoRequest(request: app.VideoRequest) {
    switch (request.type) {
      case 'loadSource':
        this.isWaiting = true;
        this.schedule();
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

  @mobx.observable
  isHidden = false;

  @mobx.observable
  isWaiting = true;

  @mobx.observable
  readonly bridge = new app.Bridge();
  
  @mobx.observable
  readonly control = new app.MainControlViewModel(this.bridge, this.navigator);
  
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
