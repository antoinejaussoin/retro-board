import { createTheme, adaptV4Theme } from '@mui/material/styles';
import { colors } from '@mui/material';

const theme = createTheme(
  adaptV4Theme({
    palette: {
      primary: colors.deepPurple,
      secondary: colors.pink,
    },
    overrides: {
      MuiDrawer: {
        paper: {
          width: '250px',
        },
      },
    },
    typography: {},
  })
);

export const Palette = {
  positive: colors.green['800'],
  negative: colors.red['400'],
};

export default theme;
