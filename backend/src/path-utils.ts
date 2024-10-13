import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function getFilename(metaUrl: string) {
  const __filename = fileURLToPath(metaUrl);

  return __filename;
}

export function getDirname(metaUrl: string) {
  const __dirname = path.dirname(getFilename(metaUrl));

  return __dirname;
}
