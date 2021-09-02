import * as app from '..';
import * as mobxReact from 'mobx-react';
import * as React from 'react';

@mobxReact.observer
export class SeriesSeasonView extends React.Component<{vm: app.SeriesSeasonViewModel}> {
  render() {
    return (
      <div>
        <h2>
          {this.props.vm.title}
        </h2>
        {this.props.vm.episodes.map(x => <app.SeriesSeasonEpisodeView key={x.id} vm={x} />)}
      </div>
    );
  }
}
