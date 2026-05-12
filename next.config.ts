import type { NextConfig } from 'next';

const SUPABASE_HOSTNAME = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try { return new URL(raw).hostname; } catch { return null; }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage — public bucket `media`
      ...(SUPABASE_HOSTNAME
        ? [{ protocol: 'https' as const, hostname: SUPABASE_HOSTNAME, pathname: '/storage/v1/object/public/**' }]
        : []),
      // Catch-all for any *.supabase.co project (covers preview deploys + URL changes)
      { protocol: 'https' as const, hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
};

export default nextConfig;
