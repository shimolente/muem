import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

export const metadata: Metadata = {
  title: {
    default: 'Muem Studio',
    template: '%s — Muem Studio',
  },
  description: 'Architecture & interior design studio.',
};

export const viewport: Viewport = {
  themeColor: '#3A342F',
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <head>
        {/* Brandon Grotesque via Adobe Fonts — public site only, but loading
            here is harmless on admin (just an extra HTTP request) */}
        <link rel="stylesheet" href="https://use.typekit.net/vxw0vrh.css" />
        <link
          rel="preload"
          href="/fonts/AireLightPro.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/AireLightItalicPro.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
