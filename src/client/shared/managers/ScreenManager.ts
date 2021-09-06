import * as app from '..';
import * as mobx from 'mobx';

export class ScreenManager implements app.IInputHandler {
  @mobx.action
  attach() {
    app.core.input.subscribe(this);
    return this;
  }

  @mobx.action
  onInputKey(event: app.InputKeyEvent) {
    if (event.type === 'fullscreen') {
      this.toggleFullscreen();
      return true;
    } else {
      return false;
    }
  }

  @mobx.action
  toggleFullscreen() {
    this.isFullscreen
      ? this.exitAsync()
      : this.enterAsync();
  }
  
  @mobx.observable
  isFullscreen = false;

  private async enterAsync() {
    try {
      await document.documentElement.requestFullscreen();
      this.isFullscreen = true;
    } catch {
      this.isFullscreen = false;
    }
  }

  private async exitAsync() {
    try {
      await document.exitFullscreen();
      this.isFullscreen = false;
    } catch {
      this.isFullscreen = false;
    }
  }
}
