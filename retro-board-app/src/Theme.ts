import { createMuiTheme } from '@material-ui/core/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';
import pink from '@material-ui/core/colors/pink';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';

const theme = createMuiTheme({
  palette: {
    primary: blueGrey,
    secondary: pink,
  },
  overrides: {
    MuiDrawer: {
      paper: {
        width: '250px',
      },
    },
  },
  typography: {},
});

export const Palette = {
  positive: green['800'],
  negative: red['400'],
};

export default theme;
