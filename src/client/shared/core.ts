import * as app from '.';
import * as history from 'history';
let api: app.api.ServerApi;
let input: app.InputManager;
let browser: history.History;
let screen: app.ScreenManager;
let store: app.StoreManager;

export const core = {
  get api() {
    api ??= new app.api.ServerApi(`${window.location.protocol}//${window.location.hostname}:6583/`);
    return api;
  },

  get browser() {
    browser ??= history.createBrowserHistory();
    return browser;
  },

  get input() {
    input ??= new app.InputManager().attach();
    return input;
  },

  get screen() {
    screen ??= new app.ScreenManager().attach();
    return screen;
  },

  get store() {
    store ??= new app.StoreManager();
    return store;
  }
};
