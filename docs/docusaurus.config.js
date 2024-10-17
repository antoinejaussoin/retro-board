const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(
  module.exports = {
    title: 'Retrospected',
    tagline: `If you want to RTFM, you are in the right place.`,
    url: 'https://docs.retrospected.com',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'antoinejaussoin', // Usually your GitHub org/user name.
    projectName: 'retro-board', // Usually your repo name.

    presets: [
      [
        '@docusaurus/preset-classic',
        /** @type {import('@docusaurus/preset-classic').Options} */
        ({
          docs: {
            sidebarPath: require.resolve('./sidebars.js'),
            editUrl:
              'https://github.com/antoinejaussoin/retro-board/edit/develop/docs/',
          },
          blog: {
            showReadingTime: true,
            editUrl:
              'https://github.com/antoinejaussoin/retro-board/edit/main/website/blog/',
          },
          theme: {
            customCss: require.resolve('./src/css/custom.css'),
          },
          gtag: {
            // You can also use your "G-" Measurement ID here.
            trackingID: 'G-60PPD8ZVHL',
            // Optional fields.
            anonymizeIP: false, // Should IPs be anonymized?
          },
        }),
      ],
    ],

    themeConfig:
      /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
      ({
        navbar: {
          title: 'Retrospected',
          logo: {
            alt: 'Retrospected Logo',
            src: 'img/icon.png',
          },
          items: [
            {
              type: 'doc',
              docId: 'intro',
              position: 'left',
              label: 'Documentation',
            },
            // { to: '/blog', label: 'Blog', position: 'left' },
            {
              href: 'https://github.com/antoinejaussoin/retro-board',
              label: 'GitHub',
              position: 'right',
            },
          ],
        },
        footer: {
          style: 'dark',
          links: [
            {
              title: 'Documentation',
              items: [
                {
                  label: 'Docs',
                  to: '/docs/intro',
                },
              ],
            },
            // {
            //   title: 'Community',
            //   items: [
            //     {
            //       label: 'Stack Overflow',
            //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            //     },
            //     {
            //       label: 'Discord',
            //       href: 'https://discordapp.com/invite/docusaurus',
            //     },
            //     {
            //       label: 'Twitter',
            //       href: 'https://twitter.com/docusaurus',
            //     },
            //   ],
            // },
            {
              title: 'More',
              items: [
                // {
                //   label: 'Blog',
                //   to: '/blog',
                // },
                {
                  label: 'GitHub',
                  href: 'https://github.com/antoinejaussoin/retro-board',
                },
              ],
            },
          ],
          copyright: `Copyright © ${new Date().getFullYear()} Retrospected Ltd.`,
        },
        prism: {
          theme: lightCodeTheme,
          darkTheme: darkCodeTheme,
        },
      
      }),
  }
);
