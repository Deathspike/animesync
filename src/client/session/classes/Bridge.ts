import * as app from '..';

export class Bridge {
  private readonly handlers: Array<app.IVideoHandler>;

  constructor() {
    this.handlers = [];
  }

  dispatchEvent(event: app.VideoEvent) {
    this.handlers.forEach(x => x.onVideoEvent?.call(x, event));
  }

  dispatchRequest(request: app.VideoRequest) {
    this.handlers.forEach(x => x.onVideoRequest?.call(x, request));
  }

  subscribe(handler: app.IVideoHandler) {
    const index = this.handlers.indexOf(handler);
    if (index === -1) this.handlers.push(handler);
  }

  unsubscribe(handler: app.IVideoHandler) {
    const index = this.handlers.indexOf(handler);
    if (index !== -1) this.handlers.splice(index, 1);
  }
}
