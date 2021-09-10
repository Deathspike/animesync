import * as app from '..';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import * as ReactRouter from 'react-router-dom';

@mobxReact.observer
export class SeriesSeasonEpisodeView extends React.Component<{vm: app.SeriesSeasonEpisodeViewModel}> {
  render() {
    return (
      <div>
        {this.props.vm.url
          ? <ReactRouter.NavLink to={this.props.vm.url}>{this.props.vm.title}</ReactRouter.NavLink>
          : this.props.vm.title}
      </div>
    );
  }
}
