interface Language {
  value: string;
  iso: string;
  name: string;
  englishName: string;
}

export default [
  { value: 'en', iso: 'gb', name: 'English', englishName: 'English' },
  { value: 'fr', iso: 'fr', name: 'Français', englishName: 'French' },
  { value: 'ar', iso: 'ae', name: 'عربي', englishName: 'Arabic' },
  {
    value: 'zhcn',
    iso: 'cn',
    name: '簡中',
    englishName: 'Chinese (Simplified)',
  },
  {
    value: 'zhtw',
    iso: 'tw',
    name: '繁中',
    englishName: 'Chinese (Traditional)',
  },
  { value: 'nl', iso: 'nl', name: 'Nederlands', englishName: 'Dutch' },
  { value: 'de', iso: 'de', name: 'Deutsch', englishName: 'German' },
  { value: 'hu', iso: 'hu', name: 'Magyar', englishName: 'Hungarian' },
  { value: 'ja', iso: 'jp', name: '日本語', englishName: 'Japanese' },
  { value: 'pl', iso: 'pl', name: 'Polski', englishName: 'Polish' },
  {
    value: 'ptbr',
    iso: 'br',
    name: 'Português Brasileiro',
    englishName: 'Portuguese (Brazilian)',
  },
  { value: 'ru', iso: 'ru', name: 'Русский', englishName: 'Russian' },
  { value: 'es', iso: 'es', name: 'Español', englishName: 'Spanish' },
  { value: 'it', iso: 'it', name: 'Italiano', englishName: 'Italian' },
] as Language[];
