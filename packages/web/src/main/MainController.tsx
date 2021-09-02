import * as app from '.';
import * as mobxReact from 'mobx-react';
import * as React from 'react';

@mobxReact.observer
export class MainController extends React.Component {
  private readonly vm = new app.MainViewModel();

  componentDidMount() {
    this.vm.refreshAsync();
  }

  render() {
    return this.vm.isLoaded && <app.MainView vm={this.vm} />;
  }
}
