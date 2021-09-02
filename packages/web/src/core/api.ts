import * as app from '.';

export const server = new app.api.ServerApi(`${window.location.protocol}//${window.location.hostname}:6583/`);
