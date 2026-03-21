import * as rawStyledComponents from 'styled-components/dist/styled-components.cjs.js';

const styled = resolveStyledFactory();

export const ThemeProvider = rawStyledComponents.ThemeProvider;
export const createGlobalStyle = rawStyledComponents.createGlobalStyle;
export const keyframes = rawStyledComponents.keyframes;
export const css = rawStyledComponents.css;
export const StyleSheetManager = rawStyledComponents.StyleSheetManager;
export const ServerStyleSheet = rawStyledComponents.ServerStyleSheet;

export default styled;

function resolveStyledFactory() {
  const candidate =
    'default' in rawStyledComponents
      ? rawStyledComponents.default
      : rawStyledComponents;

  if (
    candidate &&
    typeof candidate === 'object' &&
    'default' in candidate &&
    typeof candidate.default === 'function'
  ) {
    return candidate.default;
  }

  return candidate;
}