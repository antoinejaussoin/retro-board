import { useConfig } from '@/common/hooks/useConfig';
import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

type DocumentProps = {
  locale: string;
};

export default function Document({ locale }: DocumentProps) {
  const config = useConfig();
  return (
    <Html lang={locale}>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Manrope:wght@400;500;700;800&display=swap"
        />
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`}
        />
        <Script
          id="gtag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${config.measurementId}');
          `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export const getStaticProps = async ({ locale }: { locale?: string }) => ({
  props: {
    locale,
  },
});
