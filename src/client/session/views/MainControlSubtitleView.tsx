import * as app from '..';
import * as mobxReact from 'mobx-react';
import * as mui from '@material-ui/core';
import * as React from 'react';
import {language} from '../language';

@mobxReact.observer
class View extends app.StyleComponent<typeof Styles, {vm: app.MainControlSubtitleViewModel}> {
  render() {
    return (
      <mui.Grid className={this.classes.container}>
        <app.MenuComponent className={this.classes.menu} disabled={!this.props.vm.canSelect} elevation={0} placement="bottom-end">
          <mui.IconButton disabled={!this.props.vm.canSelect}>
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

  private subtitleItem(i: number, subtitle?: app.ISubtitle) {
    const displayName = subtitle
      ? getSubtitleNames(subtitle)
      : language.subtitle;
    const isChecked = subtitle
      ? this.props.vm.selectedSubtitle?.language === subtitle.language
      : this.props.vm.selectedSubtitle == null;
    const onClick = subtitle
      ? () => this.props.vm.select(subtitle)
      : () => this.props.vm.clear();
    return (
      <mui.MenuItem key={i} onClick={onClick}>
        <mui.FormControlLabel className={this.classes.label} control={<mui.Radio checked={isChecked} color="primary" />} label={<mui.Grid>
          <mui.Typography>{displayName}</mui.Typography>
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

function getSubtitleNames(subtitle: app.ISubtitle) {
  switch (subtitle.language) {
    case 'ara': return language.subtitleAra;
    case 'eng': return language.subtitleEng;
    case 'fre': return language.subtitleFre;
    case 'ger': return language.subtitleGer;
    case 'ita': return language.subtitleIta;
    case 'por': return language.subtitlePor;
    case 'rus': return language.subtitleRus;
    case 'spa': return language.subtitleSpa;
    case 'spa-419': return language.subtitleSpa419;
    case 'tur': return language.subtitleTur;
    default: return [subtitle.language, subtitle.language];
  }
}
