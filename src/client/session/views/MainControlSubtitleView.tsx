import * as app from '..';
import * as mobxReact from 'mobx-react';
import * as mui from '@material-ui/core';
import * as React from 'react';
import {language} from '../language';

@mobxReact.observer
class View extends app.ViewComponent<typeof Styles, {vm: app.MainControlSubtitleViewModel}> {
  render() {
    return (
      <mui.Grid className={this.classes.container}>
        <app.MenuComponent className={this.classes.menu} disabled={!this.props.vm.canSelectSize} elevation={0} placement="bottom-end">
          <mui.IconButton disabled={!this.props.vm.canSelectSize}>
            <app.icons.FormatSize />
          </mui.IconButton>
          <mui.Grid>
            {this.sizeItem('tiny', language.sizeTiny)}
            {this.sizeItem('small', language.sizeSmall)}
            {this.sizeItem('normal', language.sizeNormal)}
            {this.sizeItem('large', language.sizeLarge)}
            {this.sizeItem('huge', language.sizeHuge)}
          </mui.Grid>
        </app.MenuComponent>
        <app.MenuComponent className={this.classes.menu} disabled={!this.props.vm.canSelectSubtitle} elevation={0} placement="bottom-end">
          <mui.IconButton disabled={!this.props.vm.canSelectSubtitle}>
            <app.icons.Subtitles />
          </mui.IconButton>
          <mui.Grid>
            {this.subtitleItem(0)}
            <mui.Divider />
            {this.props.vm.subtitles.map((subtitle, i) => this.subtitleItem(i + 1, subtitle))}
          </mui.Grid>
        </app.MenuComponent>
      </mui.Grid>
    );
  }

  private sizeItem(size: app.ISubtitle['size'], label: string) {
    return (
      <mui.MenuItem key={size} onClick={() => this.props.vm.selectSize(size)}>
        <mui.FormControlLabel className={this.classes.label} label={label} control={<mui.Radio
          checked={this.props.vm.selectedSubtitle?.size === size}
          color="primary" />} />
      </mui.MenuItem>
    );
  }

  private subtitleItem(i: number, subtitle?: app.ISubtitle) {
    const displayNames = subtitle
      ? subtitle.displayNames
      : language.subtitle;
    const isChecked = subtitle
      ? this.props.vm.selectedSubtitle?.language === subtitle.language
      : this.props.vm.selectedSubtitle == null;
    const onClick = subtitle
      ? () => this.props.vm.selectSubtitle(subtitle)
      : () => this.props.vm.clear();
    return (
      <mui.MenuItem key={i} onClick={onClick}>
        <mui.FormControlLabel className={this.classes.label} control={<mui.Radio checked={isChecked} color="primary" />} label={<mui.Grid>
          <mui.Typography>{displayNames && displayNames[0]}</mui.Typography>
          <mui.Typography className={this.classes.regionText}>{displayNames && displayNames[1]}</mui.Typography>
        </mui.Grid>} />
      </mui.MenuItem>
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
  },
  regionText: {
    fontStyle: 'italic'
  }
});

export const MainControlSubtitleView = mui.withStyles(Styles)(View);
