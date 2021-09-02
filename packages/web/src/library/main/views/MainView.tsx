import * as app from '..';
import * as mobxReact from 'mobx-react';
import * as React from 'react';

@mobxReact.observer
export class MainView extends React.Component<{vm: app.MainViewModel}> {
  render() {
    return (
      <div>
        {this.props.vm.series.map(x => <app.SeriesView key={x.id} vm={x} />)}
      </div>
    );
  }
}
