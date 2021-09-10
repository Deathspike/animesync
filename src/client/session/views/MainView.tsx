import * as app from '..';
import * as mobxReact from 'mobx-react';
import * as mui from '@material-ui/core';
import * as React from 'react';
import Hls from 'hls.js';

@mobxReact.observer
class View extends app.ViewComponent<typeof Styles, {vm: app.MainViewModel}> implements app.IVideoHandler {
  private readonly hls = new Hls();
  private readonly vtt = React.createRef<HTMLDivElement>();
  private octopus?: app.Octopus;
  private player?: HTMLVideoElement;

  componentDidMount() {
    document.body.style.overflow = 'hidden';
  }
  
  componentWillUnmount() {
    super.componentWillUnmount();
    document.body.style.removeProperty('overflow');
    this.onDestroy();
  }

  onVideoRequest(request: app.VideoRequest) {
    switch (request.type) {
      case 'clearSubtitle':
        this.clearSubtitle();
        break;
      case 'loadSource':
        if (!this.player) break;
        if (request.source.type === 'src') {
          this.player.src = request.source.urls[0];
        } else {
          this.hls.loadSource(request.source.urls[0]);
          this.hls.attachMedia(this.player);
        }
        break;
      case 'loadSubtitle':
        this.clearSubtitle();
        if (request.subtitle.type === 'vtt') this.createSrt(request);
        else this.createAss(request);
        break;
      case 'pause':
        this.player?.pause();
        break;
      case 'play':
        this.player?.play();
        break;
      case 'seek':
        if (!this.player) break;
        this.player.currentTime = request.time;
        break;
    }
  }

  render() {
    return (
      <mui.Grid className={this.props.vm.isHidden ? this.classes.containerHidden : this.classes.container}>
        <video className={this.classes.player} autoPlay crossOrigin="anonymous" ref={(el) => this.onCreate(el)} onClick={() => this.props.vm.onVideoClick()} />
        <mui.Grid className={this.classes.subtitleContainer} ref={this.vtt} />
        <app.LoaderView open={this.props.vm.isWaiting} />
        <app.MainControlView className={this.classes.ui} vm={this.props.vm.control} />
      </mui.Grid>
    );
  }

  private clearSubtitle() {
    Array.from(this.player?.querySelectorAll('track') ?? []).forEach(x => this.player?.removeChild(x));
    this.octopus?.dispose();
    delete this.octopus;
  }

  private createAss(request: app.VideoRequest) {
    if (request.type !== 'loadSubtitle' || !this.player) return;
    this.octopus = new app.Octopus(this.player, request.subtitle);
    this.octopus.loadAsync().catch(() => {});
  }

  private createSrt(request: app.VideoRequest) {
    if (request.type !== 'loadSubtitle' || !this.player) return;
    const track = this.player.appendChild(document.createElement('track'));
    track.default = true;
    track.src = request.subtitle.url;
    track.addEventListener('load', () => {
      if (!this.vtt.current) return;
      app.WebVtt.attach(this.vtt.current, track);
      this.vtt.current.setAttribute('size', request.subtitle.size ?? 'normal');
    });
  }

  private onCreate(player: HTMLVideoElement | null) {
    if (!player || this.player) return;
    this.player = player;
    this.props.vm.bridge.subscribe(this);
    this.props.vm.bridge.dispatchEvent({type: 'create'});
    app.Dispatcher.attach(this.props.vm.bridge, this.hls, this.player);
  }

  private onDestroy() {
    this.props.vm.bridge.unsubscribe(this);
    this.hls.destroy();
    this.octopus?.dispose();
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
  player: {
    backgroundColor: '#000',
    height: '100vh',
    width: '100vw'
  },
  subtitleContainer: {
    pointerEvents: 'none',
    fontFamily: 'Trebuchet MS',
    lineHeight: 'normal',
    textAlign: 'center',
    textShadow: `#000 0px 0px ${app.sz(1)}, #000 0px 0px ${app.sz(1)}, #000 0px 0px ${app.sz(1)}, #000 0px 0px ${app.sz(1)}, #000 0px 0px ${app.sz(1)}, #000 0px 0px ${app.sz(1)}`,
    whiteSpace: 'pre-line',
    position: 'absolute',
    width: '100vw',
    inset: `auto auto ${app.sz(25)}`,
    '&[size=tiny]': {fontSize: app.sz(12)},
    '&[size=small]': {fontSize: app.sz(16)},
    '&[size=normal]': {fontSize: app.sz(20)},
    '&[size=large]': {fontSize: app.sz(26)},
    '&[size=huge]': {fontSize: app.sz(36)}
  },
  ui: {
    opacity: 1,
    transition: 'opacity 0.25s ease'
  }
});

export const MainView = mui.withStyles(Styles)(View);
