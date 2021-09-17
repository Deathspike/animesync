import * as app from '.';
import * as mobxReact from 'mobx-react';
import * as React from 'react';

@mobxReact.observer
export class WatchController extends React.Component<{match: {params: {seriesId: string, episodeId: string}}}> {
  private readonly vm = new app.WatchViewModel();
  private episodeId = this.props.match.params.episodeId;
  private seriesId = this.props.match.params.seriesId;

  componentDidMount() {
    this.vm.loadAsync(this.seriesId, this.episodeId);
  }

  componentDidUpdate() {
    if (this.props.match.params.seriesId === this.seriesId && this.props.match.params.episodeId === this.episodeId) return;
    this.seriesId = this.props.match.params.seriesId;
    this.episodeId = this.props.match.params.episodeId;
    this.vm.loadAsync(this.seriesId, this.episodeId);
  }

  componentWillUnmount() {
    this.vm.detach();
  }

  render() {
    if (this.vm.player && this.vm.session) {
      return <app.session.MainView key={location.href} player={this.vm.player} vm={this.vm.session} />;
    } else {
      return <app.session.LoaderView />;
    }
  }
}
