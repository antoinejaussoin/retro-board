import type { AppProps } from 'next/app';
import Script from 'next/script';
import { appWithTranslation, useTranslation } from 'next-i18next';
import '@redq/reuse-modal/es/index.css';
import '../common/assets/css/flaticon.css';
import '../common/assets/css/icon-example-page.css';
// swiper bundle styles
// import 'swiper/css/bundle';
import '../common/assets/css/react-slick.css';
import '../common/assets/css/rc-collapse.css';
// import 'rc-collapse/assets/index.css';
import '../common/assets/css/rc-drawer.css';
import Head from 'next/head';

function App({ Component, pageProps }: AppProps) {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0,width=device-width" />
        <meta name="apple-mobile-web-app-title" content="Retrospected" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="description" content={t('SEO.description')!} />
        <meta httpEquiv="cleartype" content="on" />

        <meta property="og:site_name" content="Retrospected" />
        <meta property="og:site" content="https://www.retrospected.com" />
        <meta property="og:title" content="Retrospected.com" />
        <meta property="og:description" content={t('SEO.description')!} />
        <meta property="og:url" content="https://www.retrospected.com" />

        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#5842DE" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />

        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default appWithTranslation(App);
