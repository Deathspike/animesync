import * as app from '..';
import * as mobxReact from 'mobx-react';
import * as React from 'react';

@mobxReact.observer
export class SeriesView extends React.Component<{vm: app.SeriesViewModel}> {
  render() {
    return (
      <div>
        <h1>
          {this.props.vm.title}
        </h1>
        {this.props.vm.seasons.map(x => <app.SeriesSeasonView key={x.id} vm={x} />)}
      </div>
    );
  }
}
