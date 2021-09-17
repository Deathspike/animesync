export interface IInputHandler {
  onInputKey?(event: InputKeyEvent, handled: boolean): boolean;
  onInputMouse?(event: InputMouseEvent, handled: boolean): boolean;
}

export type InputKeyEvent = 
  {type: 'arrowDown'} |
  {type: 'arrowLeft'} |
  {type: 'arrowRight'} |
  {type: 'arrowUp'} |
  {type: 'backspace'} |
  {type: 'enter'} | 
  {type: 'fullscreen'};

export type InputMouseEvent =
  {type: 'up'} |
  {type: 'down'} |
  {type: 'move'};
