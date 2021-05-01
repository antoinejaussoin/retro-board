import once from 'lodash/once';

const logError = once(() => {
  console.warn(
    'Your browser does not allow using local storage. Some settings will not be persisted between sessions.'
  );
});

export function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    logError();
    return null;
  }
}

export function setItem(key: string, item: string): void {
  try {
    localStorage.setItem(key, item);
  } catch (error) {
    logError();
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    logError();
  }
}
