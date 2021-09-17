import * as app from '..';
import * as mui from '@material-ui/core';
import * as React from 'react';

export class StyleComponent<TStyles extends mui.StyleRules<string, TProps>, TProps extends Object = {}> extends React.Component<TProps> {
  get classes(): Record<keyof TStyles, string> {
    return app.api.unsafe(this.props).classes;
  }
}
