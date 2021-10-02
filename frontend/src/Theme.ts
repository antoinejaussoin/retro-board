import { createTheme } from '@mui/material/styles';
import { colors } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: colors.deepPurple,
    secondary: colors.pink,
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: '250px',
        },
      },
    },
  },
});

export const Palette = {
  positive: colors.green['800'],
  negative: colors.red['400'],
};

export default theme;
