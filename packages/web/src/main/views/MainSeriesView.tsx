import * as app from '..';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import * as ReactRouter from 'react-router-dom';

@mobxReact.observer
export class SeriesView extends React.Component<{vm: app.MainSeriesViewModel}> {
  render() {
    return (
      <div>
        <ReactRouter.NavLink to={this.props.vm.url}>
          {this.props.vm.title}
        </ReactRouter.NavLink>
      </div>
    );
  }
}
