import * as app from '..';
import * as mobxReact from 'mobx-react';
import * as mui from '@material-ui/core';
import * as React from 'react';

@mobxReact.observer
class View extends app.StyleComponent<typeof Styles, {className?: string, vm: app.MainControlViewModel}> {
  render() {
    return (
      <mui.Grid className={this.props.className}>
        <app.HeaderComponent className={this.classes.appBar}
          primary={this.props.vm.titlePrimary}
          secondary={this.props.vm.titleSecondary} />
        <mui.AppBar className={this.classes.container}>
          <mui.Toolbar>
            {this.props.vm.isLoaded && <mui.Grid>
              <app.SliderComponent className={this.classes.seekBar}
                buffered={this.props.vm.currentBuffer} value={this.props.vm.currentTime} max={this.props.vm.currentDuration}
                onChange={app.api.unsafe((_: never, x: number) => this.props.vm.seekStart(x))}
                onChangeCommitted={app.api.unsafe((_: never, x: number) => this.props.vm.seekStop(x))} />
              <mui.Grid className={this.classes.beginBar}>
                <mui.Typography>
                  {this.formatTime(this.props.vm.currentTime)} / {this.formatTime(this.props.vm.currentDuration)}
                </mui.Typography>
              </mui.Grid>
            </mui.Grid>}
            <mui.Grid className={this.classes.centerBar}>
              <mui.IconButton
                disabled={!this.props.vm.hasPrevious}
                onClick={() => this.props.vm.openPrevious()}>
                <app.icons.SkipPrevious />
              </mui.IconButton>
              <mui.IconButton
                disabled={!this.props.vm.isLoaded}
                onClick={() => this.props.vm.seekBackward()}>
                <app.icons.FastRewind />
              </mui.IconButton>
              <mui.IconButton
                disabled={!this.props.vm.isLoaded}
                onClick={() => this.props.vm.togglePlay()}>
                {this.props.vm.isPlaying
                  ? <app.icons.Pause />
                  : <app.icons.PlayArrow />}
              </mui.IconButton>
              <mui.IconButton
                disabled={!this.props.vm.isLoaded}
                onClick={() => this.props.vm.seekForward()}>
                <app.icons.FastForward />
              </mui.IconButton>
              <mui.IconButton
                disabled={!this.props.vm.hasNext}
                onClick={() => this.props.vm.openNext()}>
                <app.icons.SkipNext />
              </mui.IconButton>
            </mui.Grid>
            <mui.Grid className={this.classes.endBar}>
              <app.MainControlSubtitleView vm={this.props.vm.subtitle} />
              <mui.IconButton onClick={() => app.core.screen.toggleFullscreen()}>
                {app.core.screen.isFullscreen
                  ? <app.icons.FullscreenExit />
                  : <app.icons.Fullscreen />}
              </mui.IconButton>
            </mui.Grid>
          </mui.Toolbar>
        </mui.AppBar>
      </mui.Grid>
    );
  }

  private formatTime(seconds: number) {
    const date = new Date(0, 0, 0, 0, 0, seconds);
    const hoursString = String(date.getHours()).padStart(2, '0');
    const minutesString = String(date.getMinutes()).padStart(2, '0');
    const secondsString = String(date.getSeconds()).padStart(2, '0');
    return date.getHours() ? `${hoursString}:${minutesString}:${secondsString}` : `${minutesString}:${secondsString}`;
  }
}

const Styles = mui.createStyles({
  appBar: {
    backgroundColor: 'transparent'
  },
  container: {
    backgroundColor: 'rgba(50, 50, 50, 0.5)',
    position: 'absolute',
    bottom: 0,
    top: 'unset'
  },
  seekBar: {
    padding: `${app.sz(8)} 0`,
    position: 'absolute',
    top: 0,
    transform: 'translateY(-50%)'
  },
  beginBar: {
    position: 'absolute',
    left: app.sz(8),
    top: '50%',
    transform: 'translateY(-50%)'
  },
  centerBar: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)'
  },
  endBar: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)'
  }
});

export const MainControlView = mui.withStyles(Styles)(View);
