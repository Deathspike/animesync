export interface IInputHandler {
  onInputKey?(event: InputKeyEvent, handled: boolean): boolean;
  onInputMouse?(event: InputMouseEvent, handled: boolean): boolean;
}

export interface IViewHandler {
  onViewMount?(): void;
  onViewUnmount?(): void;
}

export type InputKeyEvent = 
  {type: 'arrowDown'} |
  {type: 'arrowLeft'} |
  {type: 'arrowRight'} |
  {type: 'arrowUp'} |
  {type: 'enter'} | 
  {type: 'escape'} |
  {type: 'fullscreen'};

export type InputMouseEvent =
  {type: 'up'} |
  {type: 'down'} |
  {type: 'move'};
