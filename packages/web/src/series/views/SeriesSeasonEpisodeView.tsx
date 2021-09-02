import * as app from '..';
import * as mobxReact from 'mobx-react';
import * as React from 'react';

@mobxReact.observer
export class SeriesSeasonEpisodeView extends React.Component<{vm: app.SeriesSeasonEpisodeViewModel}> {
  render() {
    return (
      <div>
        {this.props.vm.url
          ? <a href={this.props.vm.url}>{this.props.vm.title}</a>
          : this.props.vm.title}
      </div>
    );
  }
}
