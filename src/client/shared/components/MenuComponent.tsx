import * as app from '..';
import * as mui from '@material-ui/core';
import * as React from 'react';

export class Component extends app.StyleComponent<typeof Styles, {className?: string, disabled?: boolean, elevation?: number, children: React.ReactNode | React.ReactNodeArray, placement: mui.PopperPlacementType}> {
  state = {
    anchorEl: undefined,
  };

  render() {
    const firstChild = Array.isArray(this.props.children)
      ? this.props.children[0]
      : this.props.children;
    const menuItems = Array.isArray(this.props.children)
      ? this.props.children.slice(1)
      : undefined;
    return (
      <mui.Grid>
        {this.props.disabled || !menuItems
          ? <mui.Grid>{firstChild}</mui.Grid>
          : <mui.Grid onClick={(ev) => this.setState({anchorEl: ev.currentTarget})}>{firstChild}</mui.Grid>}
        {menuItems && <mui.Popper anchorEl={this.state.anchorEl} open={Boolean(this.state.anchorEl)} disablePortal placement={this.props.placement}>
          <mui.Paper className={this.props.className} elevation={this.props.elevation} square>
            <mui.ClickAwayListener onClickAway={() => this.setState({anchorEl: undefined})}>
              <mui.MenuList disablePadding onClick={() => this.setState({anchorEl: undefined})}>
                {menuItems}
              </mui.MenuList>
            </mui.ClickAwayListener>
          </mui.Paper>
        </mui.Popper>}
      </mui.Grid>
    );
  }
}

const Styles = mui.createStyles({
});

export const MenuComponent = mui.withStyles(Styles)(Component);
