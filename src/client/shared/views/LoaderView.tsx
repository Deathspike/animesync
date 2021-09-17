import * as app from '..';
import * as mui from '@material-ui/core';
import * as mobxReact from 'mobx-react';
import * as React from 'react';

@mobxReact.observer
class View extends app.StyleComponent<typeof Styles, {open?: boolean, quiet?: boolean, vm?: app.LoaderViewModel}> { 
  render() {
    if (!this.props.open && !this.props.vm?.isLoading) {
      return false;
    } else if (!this.props.quiet && !this.props.vm?.isQuiet) {
      return <mui.CircularProgress className={this.classes.circular} />;
    } else {
      return <mui.LinearProgress className={this.classes.linear} />;
    }
  }
}

const Styles = mui.createStyles({
  circular: {
    animation: 'none',
    height: `${app.sz(32)} !important`,
    width: `${app.sz(32)} !important`,
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)'
  },
  linear: {
    height: app.sz(2),
    width: '100%',
    zIndex: 1,
    position: 'fixed',
    bottom: 0
  }
});

export const LoaderView = mui.withStyles(Styles)(View);
