import * as rawThemeGet from '@styled-system/theme-get/dist/index.esm.js';

const normalizedThemeGet = resolveThemeGet();

export const themeGet =
  'themeGet' in rawThemeGet && typeof rawThemeGet.themeGet === 'function'
    ? rawThemeGet.themeGet
    : normalizedThemeGet;

export default normalizedThemeGet;

function resolveThemeGet() {
  const candidate =
    'default' in rawThemeGet ? rawThemeGet.default : rawThemeGet;

  if (
    candidate &&
    typeof candidate === 'object' &&
    'default' in candidate &&
    typeof candidate.default === 'function'
  ) {
    return candidate.default;
  }

  return candidate as typeof import('@styled-system/theme-get').default;
}
