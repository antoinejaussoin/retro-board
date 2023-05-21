import type { AppProps } from 'next/app';
import { appWithTranslation, useTranslation } from 'next-i18next';
import '../common/assets/css/flaticon.css';
import '../common/assets/css/react-slick.css';
import '../common/assets/css/rc-collapse.css';
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
        <meta property="og:title" content="Retrospected.com" key="og:title" />
        <meta
          property="og:description"
          content={t('SEO.description')!}
          key="og:description"
        />
        <meta
          property="og:url"
          content="https://www.retrospected.com"
          key="og:url"
        />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
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
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#ffc40d" />

        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default appWithTranslation(App);
