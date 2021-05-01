import Bowser from 'bowser';

export default function useIsCompatibleBrowser() {
  const browser = Bowser.getParser(window.navigator.userAgent);
  const isValidBrowser = browser.satisfies({
    'internet explorer': '>=11',
    safari: '>=9',
    chrome: '>=60',
    firefox: '>=52',
    opera: '>=45',
  });
  return isValidBrowser !== false;
}
