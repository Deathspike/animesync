import * as app from '..';
import * as ReactRouter from 'react-router-dom';

export class BrowserHistory extends ReactRouter.BrowserRouter {
  history = app.shared.core.browser;
}
