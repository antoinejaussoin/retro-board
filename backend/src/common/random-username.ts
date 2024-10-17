import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from 'unique-names-generator';
import { v4 } from 'uuid';

export function generateUsername() {
  const shortName: string = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: ' ',
    style: 'capital',
    length: 2,
    seed: v4(),
  });

  return shortName;
}
