import config from './utils/getConfig';

const SHADE_KEYS = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  'a100',
  'a200',
  'a400',
  'a700',
] as const;

const DEEP_PURPLE = [
  '#ede7f6',
  '#d1c4e9',
  '#b39ddb',
  '#9575cd',
  '#7e57c2',
  '#673ab7',
  '#5e35b1',
  '#512da8',
  '#4527a0',
  '#311b92',
  '#b388ff',
  '#7c4dff',
  '#651fff',
  '#6200ea',
];

const PINK = [
  '#fce4ec',
  '#f8bbd0',
  '#f48fb1',
  '#f06292',
  '#ec407a',
  '#e91e63',
  '#d81b60',
  '#c2185b',
  '#ad1457',
  '#880e4f',
  '#ff80ab',
  '#ff4081',
  '#f50057',
  '#c51162',
];

export const Palette = {
  positive: '#2e7d32',
  negative: '#ef5350',
};

export type HeaderTone = 'light' | 'dark';

export let headerTone: HeaderTone = 'dark';

function parsePalette(value: string): string[] | null {
  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length !== 14) {
    return null;
  }
  return parts;
}

function channel(hex: string, start: number): number {
  return Number.parseInt(hex.slice(start, start + 2), 16);
}

export function isLightColor(input: string): boolean {
  const value = input.trim().toLowerCase();
  if (value === 'white') {
    return true;
  }
  if (value === 'black') {
    return false;
  }
  const rgb = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) {
    return luminance(Number(rgb[1]), Number(rgb[2]), Number(rgb[3])) > 0.72;
  }
  const hex = value.replace('#', '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex;
  if (!/^[0-9a-f]{6}$/.test(full)) {
    return false;
  }
  return luminance(channel(full, 0), channel(full, 2), channel(full, 4)) > 0.72;
}

function luminance(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export function applyBrand(): void {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  const primary = parsePalette(config.PRIMARY_COLOR) ?? DEEP_PURPLE;
  const secondary = parsePalette(config.SECONDARY_COLOR) ?? PINK;
  SHADE_KEYS.forEach((shade, index) => {
    root.style.setProperty(`--brand-primary-${shade}`, primary[index] ?? '');
    root.style.setProperty(
      `--brand-secondary-${shade}`,
      secondary[index] ?? '',
    );
  });
  const headerBg = config.HEADER_PRIMARY_COLOR || primary[7] || '#512da8';
  const headerFg = config.HEADER_SECONDARY_COLOR || '#ffffff';
  root.style.setProperty('--brand-header-bg', headerBg);
  root.style.setProperty('--brand-header-fg', headerFg);
  headerTone = isLightColor(headerBg) ? 'light' : 'dark';
  root.dataset.headerTone = headerTone;
}

applyBrand();
