import * as app from '..';
import * as mui from '@material-ui/core';

export const SliderComponent = mui.withStyles(() => ({
  rail: {
    borderRadius: 0,
    height: app.sz(2),
    width: (props: mui.SliderProps & {buffered: number}) => (props.max ? 100 / props.max * props.buffered : 0) + '%'
  },
  track: {
    borderRadius: 0,
    height: app.sz(2)
  },
  thumb: {
    borderRadius: app.sz(12),
    marginTop: 0,
    height: app.sz(12),
    width: app.sz(12),
    transform: `translateY(calc(-50% + ${app.sz(1)}))`,
    '&:hover': {boxShadow: 'none'},
    '&.Mui-focusVisible': {boxShadow: 'none'},
    '&.MuiSlider-active': {boxShadow: 'none'},
    '&:after': {bottom: app.sz(-8), left: app.sz(-8), right: app.sz(-8), top: app.sz(-8)}
  }
}))(mui.Slider);
