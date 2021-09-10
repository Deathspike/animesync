import * as app from '.';
import * as mobxReact from 'mobx-react';
import * as React from 'react';

@mobxReact.observer
export class WatchController extends React.Component<{match: {params: {seriesId: string, episodeId: string}}}> {
  private readonly vm = new app.WatchViewModel(this.props.match.params.seriesId, this.props.match.params.episodeId);

  componentDidMount() {
    this.vm.refreshAsync();
  }

  render() {
    if (this.vm.session) {
      return <app.session.MainView key={location.href} vm={this.vm.session} />;
    } else {
      return <app.session.LoaderView />;
    }
  }
}
