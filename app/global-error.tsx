'use client';

/**
 * Root error boundary — catches errors thrown in the root layout itself.
 * Must render its own <html>/<body> because it replaces the whole document.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#35322F',
          color: '#F4F3F0',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 400, margin: '0 0 12px' }}>Something went wrong</h1>
          <p style={{ opacity: 0.7, margin: '0 0 24px', lineHeight: 1.5 }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#F4F3F0',
              color: '#35322F',
              border: 'none',
              borderRadius: 999,
              padding: '10px 24px',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
