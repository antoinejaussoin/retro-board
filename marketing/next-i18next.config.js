const subDomain = process.env.NEXT_BACKEND_SUB_DOMAIN;

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'], // , 'de', 'nl'],
    domains: [
      {
        domain: `${subDomain}.retrospected.com`,
        defaultLocale: 'en',
      },
      {
        domain: `${subDomain}.retrospected.fr`,
        defaultLocale: 'fr',
      },
      // {
      //   domain: `${subDomain}.retrospected.de`,
      //   defaultLocale: 'de',
      // }
    ],
  },
}