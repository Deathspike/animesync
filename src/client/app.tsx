import * as app from '.';
import * as mobx from 'mobx';
import * as mui from '@material-ui/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactRouter from 'react-router-dom';
const packageData = require('../../package');

function App() {
  return (
    <mui.MuiThemeProvider theme={app.shared.theme}>
      <mui.CssBaseline />
      <Router />
    </mui.MuiThemeProvider>
  );
}

function Router() {
  return (
    <app.shared.BrowserHistory>
      <ReactRouter.Switch>
        <ReactRouter.Route exact strict path="/web/" component={app.library.MainController} />
        <ReactRouter.Route exact strict path="/web/:seriesId/" component={app.library.SeriesController} />
        <ReactRouter.Route exact strict path="/web/:seriesId/:episodeId/" component={app.library.WatchController} />
        <ReactRouter.Redirect to="/web/" />
      </ReactRouter.Switch>
    </app.shared.BrowserHistory>
  )
}

(function() {
  document.title = `${packageData.name} (${packageData.version})`;
  mobx.configure({enforceActions: 'never'});
  ReactDOM.render(<App />, document.getElementById('container'));
})();
