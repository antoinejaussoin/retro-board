import { PluralWord } from './types';

export function plural(word: string, pluralForm?: string): PluralWord {
  return (n: number): string => {
    if (pluralForm) {
      return n === 1 ? word : pluralForm;
    }
    return `${word}${n === 1 ? '' : 's'}`;
  };
}
