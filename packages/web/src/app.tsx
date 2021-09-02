import * as app from '.';
import * as mobx from 'mobx';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactRouter from 'react-router-dom';
const packageData = require('../../../package');

function App() {
  return (
    <ReactRouter.BrowserRouter>
      <ReactRouter.Switch>
        <ReactRouter.Route exact strict path="/web/" component={app.MainController} />
        <ReactRouter.Route exact strict path="/web/:seriesId/" component={app.SeriesController} />
        <ReactRouter.Redirect to="/web/" />
      </ReactRouter.Switch>
    </ReactRouter.BrowserRouter>
  )
}

(function() {
  document.title = `${packageData.name} (${packageData.version})`;
  mobx.configure({enforceActions: 'never'});
  ReactDOM.render(<App />, document.getElementById('container'));
})();
