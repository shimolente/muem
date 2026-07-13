'use client';

import { useEffect } from 'react';

/**
 * Admin shell error boundary — recovers a broken admin route without losing
 * the whole panel. Logs server digest for debugging.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This admin view failed to load. You can retry, or reload the page.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground/70">Ref: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
