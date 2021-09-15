import * as app from '..';

export class InputManager {
  private readonly handlers: Array<app.IInputHandler>;

  constructor() {
    this.handlers = [];
  }

  attach() {
    document.addEventListener('keydown', this.onKeyEvent.bind(this));
    document.addEventListener('mousedown', this.onMouseEvent.bind(this));
    document.addEventListener('mousemove',this.onMouseEvent.bind(this));
    document.addEventListener('mouseup', this.onMouseEvent.bind(this));
    return this;
  }
 
  subscribe(handler: app.IInputHandler) {
    const index = this.handlers.indexOf(handler);
    if (index === -1) this.handlers.push(handler);
  }

  unsubscribe(handler: app.IInputHandler) {
    const index = this.handlers.indexOf(handler);
    if (index !== -1) this.handlers.splice(index, 1);
  }

  private dispatchKeyEvent(source: KeyboardEvent, event: app.InputKeyEvent) {
    if (!this.handlers.slice().reverse().reduce((p, h) => h.onInputKey?.call(h, event, p) || p, false)) return;
    source.preventDefault();
  }
  
  private dispatchMouseEvent(source: MouseEvent, event: app.InputMouseEvent) {
    if (!this.handlers.slice().reverse().reduce((p, h) => h.onInputMouse?.call(h, event, p) || p, false)) return;
    source.preventDefault();
  }

  private onKeyEvent(event: KeyboardEvent) {
    if (document.activeElement 
      && /^input$/i.test(document.activeElement.tagName)
      && /^(?:text|password)?$/i.test(document.activeElement.getAttribute('type') ?? '')) return;
    switch (event.code) {
      case 'ArrowDown':
        this.dispatchKeyEvent(event, {type: 'arrowDown'});
        break;
      case 'ArrowLeft':
        this.dispatchKeyEvent(event, {type: 'arrowLeft'});
        break;
      case 'ArrowRight':
        this.dispatchKeyEvent(event, {type: 'arrowRight'});
        break;
      case 'ArrowUp':
        this.dispatchKeyEvent(event, {type: 'arrowUp'});
        break;
      case 'Backslash':
        this.dispatchKeyEvent(event, {type: 'fullscreen'});
        break;
      case 'Backspace':
        this.dispatchKeyEvent(event, {type: 'backspace'});
        break;
      case 'Enter':
        this.dispatchKeyEvent(event, event.altKey ? {type: 'fullscreen'} : {type: 'enter'});
        break;
      case 'F11':
        this.dispatchKeyEvent(event, {type: 'fullscreen'});
        break;
      case 'KeyF':
        this.dispatchKeyEvent(event, {type: 'fullscreen'});
        break;
      case 'Space':
        this.dispatchKeyEvent(event, {type: 'enter'});
        break;
    }
  }

  private onMouseEvent(event: MouseEvent) {
    switch (event.type) {
      case 'mousedown':
        this.dispatchMouseEvent(event, {type: 'down'});
        break;
      case 'mousemove':
        this.dispatchMouseEvent(event, {type: 'move'});
        break;
      case 'mouseup':
        this.dispatchMouseEvent(event, {type: 'up'});
        break;
    }
  }
}
