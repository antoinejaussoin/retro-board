interface Language {
  value: string;
  iso: string;
  name: string;
  englishName: string;
}

export default [
  { value: 'en', iso: 'gb', name: 'English', englishName: 'English' },
  { value: 'es', iso: 'es', name: 'Español', englishName: 'Spanish' },
  { value: 'fr', iso: 'fr', name: 'Français', englishName: 'French' },
  { value: 'hu', iso: 'hu', name: 'Magyar', englishName: 'Hungarian' },
  { value: 'nl', iso: 'nl', name: 'Nederlands', englishName: 'Dutch' },
  { value: 'pl', iso: 'pl', name: 'Polski', englishName: 'Polish' },
  {
    value: 'ptbr',
    iso: 'br',
    name: 'Português Brasileiro',
    englishName: 'Brazilian Portuguese',
  },
  { value: 'ru', iso: 'ru', name: 'Русский', englishName: 'Russian' },
  {
    value: 'zhtw',
    iso: 'tw',
    name: '繁中',
    englishName: 'Traditional Chinese',
  },
  { value: 'zhcn', iso: 'cn', name: '簡中', englishName: 'Simplified Chinese' },
  { value: 'ar', iso: 'ae', name: 'عربي', englishName: 'Arabic' },
  { value: 'ja', iso: 'jp', name: '日本語', englishName: 'Japanese' },
] as Language[];
