import * as app from '..';
import * as mobxReact from 'mobx-react';
import * as mui from '@material-ui/core';
import * as React from 'react';

@mobxReact.observer
class View extends app.ViewComponent<typeof Styles, {vm: app.MainViewModel}> implements app.IVideoHandler {
  private readonly renderer = new app.Renderer();

  componentDidMount() {
    this.props.vm.bridge.subscribe(this);
    app.Dispatcher.attach(this.props.vm.bridge, this.renderer.video);
    document.body.style.overflow = 'hidden';
  }
  
  componentWillUnmount() {
    super.componentWillUnmount();
    document.body.style.removeProperty('overflow');
    this.props.vm.bridge.unsubscribe(this);
  }

  onInputKey(event: app.InputKeyEvent) {
    if (event.type === 'enter') {
      this.props.vm.control.togglePlay();
      return true;
    } else if (event.type === 'arrowDown') {
      this.props.vm.control.openPrevious();
      return true;
    } else if (event.type === 'arrowLeft') {
      this.props.vm.control.seekBackward();
      return true;
    } else if (event.type === 'arrowRight') {
      this.props.vm.control.seekForward();
      return true;
    } else if (event.type === 'arrowUp') {
      this.props.vm.control.openNext();
      return true;
    } else {
      return false;
    }
  }

  onVideoRequest(request: app.VideoRequest) {
    switch (request.type) {
      case 'clearSubtitle':
        this.renderer.clearSubtitle();
        break;
      case 'loadSource':
        this.renderer.video.src = request.source.url;
        break;
      case 'loadSubtitle':
        this.renderer.subtitleAsync(request.subtitle.type, request.subtitle.url);
        break;
      case 'pause':
        this.renderer.video.pause();
        break;
      case 'play':
        this.renderer.video.play();
        break;
      case 'seek':
        this.renderer.video.currentTime = request.time;
        break;
    }
  }

  render() {
    return (
      <mui.Grid className={this.props.vm.isHidden ? this.classes.containerHidden : this.classes.container}>
        <app.LoaderView open={this.props.vm.isWaiting} />
        <mui.Grid className={this.classes.playerContainer} ref={(el) => this.onVideoRef(el)} onClick={() => this.props.vm.onVideoClick()} />
        <mui.Grid className={this.classes.subtitleContainer} ref={(el) => this.onVttRef(el)} />
        <app.MainControlView className={this.classes.ui} vm={this.props.vm.control} />
      </mui.Grid>
    );
  }

  private onVideoRef(el: HTMLElement | null) {
    if (!el || el.firstElementChild === this.renderer.video) return;
    while (el.firstElementChild) el.removeChild(el.firstElementChild);
    el.appendChild(this.renderer.video);
  }

  private onVttRef(el: HTMLElement | null) {
    if (!el || el.firstElementChild === this.renderer.vtt) return;
    while (el.firstElementChild) el.removeChild(el.firstElementChild);
    el.appendChild(this.renderer.vtt);
  }
}

const Styles = mui.createStyles({
  container: {
    height: '100vh'
  },
  containerHidden: {
    cursor: 'none',
    height: '100vh',
    '& $ui': {opacity: 0, pointerEvents: 'none'}
  },
  playerContainer: {
    backgroundColor: '#000',
    '& video': {
      height: '100vh',
      width: '100vw'
    }
  },
  subtitleContainer: {
    pointerEvents: 'none',
    fontFamily: 'Trebuchet MS',
    fontSize: app.sz(20),
    lineHeight: 'normal',
    textAlign: 'center',
    textShadow: `#000 0px 0px ${app.sz(1)}, #000 0px 0px ${app.sz(1)}, #000 0px 0px ${app.sz(1)}, #000 0px 0px ${app.sz(1)}, #000 0px 0px ${app.sz(1)}, #000 0px 0px ${app.sz(1)}`,
    whiteSpace: 'pre-line',
    position: 'absolute',
    width: '100vw',
    inset: `auto auto ${app.sz(25)}`
  },
  ui: {
    opacity: 1,
    transition: 'opacity 0.25s ease'
  }
});

export const MainView = mui.withStyles(Styles)(View);
