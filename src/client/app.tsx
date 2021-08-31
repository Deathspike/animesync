import * as api from '../api';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

class App extends React.Component<{context: api.LibraryContext}> {
  render() {
    return (
      <div>
        {this.props.context.series.map(x => <div key={x.id}>{x.title}</div>)}
      </div>
    );
  }
}

(function() {
  const server = new api.ServerApi(`http://${window.location.hostname}:6583/`);
  server.library.contextAsync()
    .then(x => ReactDOM.render(<App context={x.value!} />, document.getElementById('container')))
    .catch((error) => console.error(error));
})();
