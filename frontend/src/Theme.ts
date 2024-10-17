import { colors } from '@mui/material';
import { type PaletteColorOptions, createTheme } from '@mui/material/styles';
import config from './utils/getConfig';

const theme = createTheme({
  palette: {
    primary: convertToColor(config.PRIMARY_COLOR, colors.deepPurple),
    secondary: convertToColor(config.SECONDARY_COLOR, colors.pink),
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

function convertToColor(
  value: string,
  defaultColor: PaletteColorOptions,
): PaletteColorOptions {
  const parts = value.split(',');
  if (parts.length !== 14) {
    return defaultColor;
  }
  return {
    '50': parts[0],
    '100': parts[1],
    '200': parts[2],
    '300': parts[3],
    '400': parts[4],
    '500': parts[5],
    '600': parts[6],
    '700': parts[7],
    '800': parts[8],
    '900': parts[9],
    A100: parts[10],
    A200: parts[11],
    A400: parts[12],
    A700: parts[13],
  };
}
