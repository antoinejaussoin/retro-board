import { variant } from 'styled-system';

const buttonStyle = variant({
  key: 'buttonStyles',
});

const colorStyle = variant({
  key: 'colorStyles',
  prop: 'colors',
});

const sizeStyle = variant({
  key: 'sizeStyles',
  prop: 'size',
});

export const cards = variant({ key: 'cards' });

export { buttonStyle, colorStyle, sizeStyle };
