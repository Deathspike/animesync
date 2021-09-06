import * as app from '..';
import * as mui from '@material-ui/core';

export class ViewComponent<TStyles extends mui.StyleRules<string, TProps> = {}, TProps extends {vm?: any} = {}> extends app.BaseComponent<TStyles, TProps> {
  constructor(props: TProps) {
    super(props);
    this.onMount(props);
  }

  componentWillReceiveProps(props: TProps) {
    if (props.vm !== this.props.vm) {
      if (isInputHandler(props.vm))
        app.core.input.subscribe(props.vm);
      if (isInputHandler(this.props.vm))
        app.core.input.unsubscribe(this.props.vm);
      if (isViewHandler(props.vm))
        props.vm.onViewMount?.call(props.vm);
      if (isViewHandler(this.props.vm))
        this.props.vm.onViewUnmount?.call(this.props.vm);
    }
  }

  componentWillUnmount() {
    if (isInputHandler(this.props.vm))
      app.core.input.unsubscribe(this.props.vm);
    if (isViewHandler(this.props.vm)) {
      this.props.vm.onViewUnmount?.call(this.props.vm);
    }
  }

  private onMount(props: TProps) {
    if (isInputHandler(props.vm))
      app.core.input.subscribe(props.vm);
    if (isViewHandler(props.vm))
      props.vm.onViewMount?.call(props.vm);
  }
}

function isInputHandler(value?: app.IInputHandler): value is app.IInputHandler {
  return Boolean(value && (value.onInputKey || value.onInputMouse));
}

function isViewHandler(value?: app.IViewHandler): value is app.IViewHandler {
  return Boolean(value && (value.onViewMount || value.onViewUnmount));
}
