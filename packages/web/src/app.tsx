import * as app from '.';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactRouter from 'react-router-dom';
const packageData = require('../../../package');

function App() {
  return (
    <ReactRouter.BrowserRouter>
      <ReactRouter.Switch>
        <ReactRouter.Route exact strict path="/library/" component={app.library.main.Controller} />
        <ReactRouter.Route exact strict path="/library/:seriesId/" component={app.library.series.Controller} />
        <ReactRouter.Redirect to="/library/" />
      </ReactRouter.Switch>
    </ReactRouter.BrowserRouter>
  )
}

(function() {
  document.title = `${packageData.name} (${packageData.version})`;
  ReactDOM.render(<App />, document.getElementById('container'));
})();
