import type { Metadata, Viewport } from 'next';
import '../styles/fonts.css';
import '../styles/global.css';

export const metadata: Metadata = {
  title: {
    default: 'Muem Studio',
    template: '%s — Muem Studio',
  },
  description: 'Architecture & interior design studio.',
};

export const viewport: Viewport = {
  themeColor: '#3A342F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Brandon Grotesque via Adobe Fonts */}
        <link rel="stylesheet" href="https://use.typekit.net/vxw0vrh.css" />
        <link
          rel="preload"
          href="/fonts/AireLightPro.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
