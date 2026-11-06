import { colors, type Theme } from '@mui/material';
import { type PaletteColorOptions, createTheme } from '@mui/material/styles';
import config from './utils/getConfig';
import { tokens } from './tokens';

const theme = createTheme({
  palette: {
    primary: convertToColor(config.PRIMARY_COLOR, colors.deepPurple),
    secondary: convertToColor(config.SECONDARY_COLOR, colors.pink),
    background: {
      default: tokens.canvas,
      paper: tokens.paper,
    },
    text: {
      primary: tokens.ink,
      secondary: tokens.muted,
    },
    divider: tokens.border,
  },
  typography: {
    fontFamily: tokens.font,
    h1: { fontWeight: 600, letterSpacing: '-0.03em' },
    h2: { fontWeight: 600, letterSpacing: '-0.03em' },
    h5: { fontWeight: 500, letterSpacing: '-0.02em' },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: tokens.radius },
  components: {
    MuiCssBaseline: {
      styleOverrides: (themeParam) => {
        const primary = themeParam.palette
          .primary as Theme['palette']['primary'] & {
          '50'?: string;
        };
        return {
          ':root': {
            '--rs-accent': primary.main,
            '--rs-accent-dark': primary.dark,
            '--rs-accent-wash': primary['50'] || primary.light,
            '--rs-accent-contrast': primary.contrastText,
            '--rs-canvas': tokens.canvas,
            '--rs-paper': tokens.paper,
            '--rs-ink': tokens.ink,
            '--rs-muted': tokens.muted,
            '--rs-border': tokens.border,
            '--rs-shadow': tokens.shadow,
          },
          body: {
            backgroundColor: tokens.canvas,
            color: tokens.ink,
          },
        };
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.border}`,
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: `1px solid ${tokens.border}`,
          boxShadow: tokens.shadow,
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundImage: 'none',
        },
        colorPrimary: {
          backgroundColor: tokens.paper,
          color: tokens.ink,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 44,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: '250px',
          borderRight: `1px solid ${tokens.border}`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.paper,
          borderRadius: 8,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: '0.75rem',
          backgroundColor: tokens.ink,
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
