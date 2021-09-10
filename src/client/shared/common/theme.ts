import * as app from '..';
import * as mui from '@material-ui/core';

export const theme = mui.createTheme({
  breakpoints: {values: {xs: 0, sm: 0, md: 0, lg: 0, xl: 0}},
  palette: {
    primary: {main: '#FA0', contrastText: '#FFF'},
    secondary: {main: '#A00', contrastText: '#AAA'},
    type: 'dark'
  },
  // spacing: (x) => app.sz(x),
  overrides: {
    MuiAppBar: {
      colorPrimary: {backgroundColor: '#333'}
    },
    MuiToolbar: {
      root: {height: app.sz(32)},
      gutters: {padding: '0 !important'},
      regular: {minHeight: '0 !important'}
    },
    MuiButton: {
      root: {minWidth: 0},
      text: {padding: `0 ${app.sz(8)}`},
      label: {fontSize: app.sz(12)}
    },
    MuiChip: {
      root: {borderRadius: app.sz(8), height: 'unset'},
      label: {fontSize: app.sz(12), padding: app.sz(8)}
    },
    MuiFormControlLabel: {
      root: {marginRight: 0},
      label: {fontSize: app.sz(12)}
    },
    MuiIconButton: {
      root: {padding: app.sz(8)}
    },
    MuiInputBase: {
      root: {fontSize: app.sz(12), '&.Mui-error $input': {backgroundColor: '#A00'}},
      input: {backgroundColor: '#616161', color: '#FFF', height: 'unset', padding: app.sz(8)}
    },
    MuiCheckbox: {
      root: {padding: app.sz(8), '& svg': {height: app.sz(15), width: app.sz(15)}}
    },
    MuiRadio: {
      root: {padding: app.sz(8), '& svg': {height: app.sz(15), width: app.sz(15)}}
    },
    MuiSvgIcon: {
      root: {fontSize: app.sz(15)}
    },
    MuiSwitch: {
      root: {height: app.sz(38), width: app.sz(58), padding: app.sz(12)},
      thumb: {height: app.sz(20), width: app.sz(20)},
      track: {borderRadius: app.sz(7)},
      switchBase: {padding: app.sz(9), '&.Mui-checked': {transform: `translateX(${app.sz(20)})`}}
    },
    MuiTypography: {
      body1: {fontSize: app.sz(12), lineHeight: app.sz(16)}
    }
  }
});
