import type { Metadata, Viewport } from 'next';

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
      </head>
      <body>{children}</body>
    </html>
  );
}
