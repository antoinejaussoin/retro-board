import type { AppProps } from 'next/app';
import Script from 'next/script';
import { appWithTranslation } from 'next-i18next';
import { Modal } from '@redq/reuse-modal';
import '@redq/reuse-modal/es/index.css';
import '../common/assets/css/flaticon.css';
import '../common/assets/css/icon-example-page.css';
// swiper bundle styles
// import 'swiper/css/bundle';
import '../common/assets/css/react-slick.css';
import '../common/assets/css/rc-collapse.css';
// import 'rc-collapse/assets/index.css';
import '../common/assets/css/rc-drawer.css';

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default appWithTranslation(App);
