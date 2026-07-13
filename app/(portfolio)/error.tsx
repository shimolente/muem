'use client';

import { useEffect } from 'react';

/**
 * Portfolio (public site) segment error boundary. Keeps the shell/nav intact
 * and offers a retry instead of falling through to the default error page.
 */
export default function PortfolioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[portfolio]', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        background: '#35322F',
        color: '#F4F3F0',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <h1 style={{ fontFamily: 'var(--font-title, serif)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 300, margin: 0 }}>
        Something went wrong
      </h1>
      <p style={{ opacity: 0.7, maxWidth: 420, lineHeight: 1.5, margin: 0 }}>
        We hit an unexpected error loading this page.
      </p>
      <button
        onClick={reset}
        style={{
          background: '#F4F3F0',
          color: '#35322F',
          border: 'none',
          borderRadius: 999,
          padding: '12px 28px',
          fontSize: '0.9rem',
          letterSpacing: '0.02em',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
