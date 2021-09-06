import * as app from '..';

export class Session implements app.IVideoHandler {
  constructor(
    private readonly bridge: app.Bridge,
    private readonly control: app.MainControlViewModel
  ) {}

  onVideoEvent(event: app.VideoEvent) {
    switch (event.type) {
      case 'loadedmetadata':
        this.load();
        break;
    }
  }

  subscribe() {
    this.bridge.subscribe(this);
  }

  unsubscribe() {
    this.bridge.unsubscribe(this);
    this.unload();
  }

  private load() {
    if (!navigator.mediaSession) return;
    navigator.mediaSession.metadata = new MediaMetadata({title: this.control.titlePrimary, artist: this.control.titleSecondary});
    navigator.mediaSession.setActionHandler('previoustrack', this.control.hasPrevious ? () => this.control.openPrevious() : null);
    navigator.mediaSession.setActionHandler('nexttrack', this.control.hasNext ? () => this.control.openNext() : null);
    navigator.mediaSession.setActionHandler('seekbackward', () => this.control.seekBackward());
    navigator.mediaSession.setActionHandler('seekforward', () => this.control.seekForward());
  }

  private unload() {
    if (!navigator.mediaSession) return;
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.setActionHandler('previoustrack', null);
    navigator.mediaSession.setActionHandler('nexttrack', null);
    navigator.mediaSession.setActionHandler('seekbackward', null);
    navigator.mediaSession.setActionHandler('seekforward', null);
  }
}
