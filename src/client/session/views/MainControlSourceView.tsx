import * as app from '..';
import * as mobxReact from 'mobx-react';
import * as mui from '@material-ui/core';
import * as React from 'react';

@mobxReact.observer
class View extends app.ViewComponent<typeof Styles, {vm: app.MainControlSourceViewModel}> {
  render() {
    return (
      <mui.Grid className={this.classes.container}>
        <app.MenuComponent className={this.classes.menu} disabled={!this.props.vm.canSelect} elevation={0} placement="bottom-end">
          <mui.IconButton disabled={!this.props.vm.canSelect}>
            <app.icons.PersonalVideo />
          </mui.IconButton>
          <mui.Grid>
            {this.props.vm.sources.map((source, i) => (
              <mui.MenuItem key={i} onClick={() => this.props.vm.select(source)}>
                <mui.FormControlLabel className={this.classes.label} label={source.displayName} control={<mui.Radio
                  checked={this.props.vm.selectedSource === source}
                  color="primary" />} />
              </mui.MenuItem>
            ))}
          </mui.Grid>
        </app.MenuComponent>
      </mui.Grid>
    );
  }
}

const Styles = mui.createStyles({
  container: {
    display: 'inline-flex'
  },
  menu: {
    backgroundColor: 'rgba(50, 50, 50, 0.5)'
  },
  label: {
    pointerEvents: 'none'
  }
});

export const MainControlSourceView = mui.withStyles(Styles)(View);
