/**
 * On-demand ISR revalidation webhook.
 *
 * Configure in Sanity dashboard:
 *   Settings → API → Webhooks → Add webhook
 *   URL:    https://your-site.vercel.app/api/revalidate
 *   Secret: same value as SANITY_REVALIDATE_SECRET env var
 *   Trigger on: Create, Update, Delete
 *
 * Env var needed:
 *   SANITY_REVALIDATE_SECRET — any random string, must match Sanity webhook secret
 */

import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await req.json() as { _type?: string };
    const type  = body._type;

    // Revalidate the relevant paths based on document type
    switch (type) {
      case 'studioProject':
        revalidatePath('/studio');
        revalidatePath('/studio/[slug]', 'page');
        revalidatePath('/');
        break;
      case 'residenceProject':
        revalidatePath('/residences');
        revalidatePath('/residences/[slug]', 'page');
        break;
      case 'furnitureItem':
        revalidatePath('/habitus');
        break;
      case 'landingPage':
        revalidatePath('/');
        break;
      default:
        revalidatePath('/');
    }

    return NextResponse.json({ revalidated: true, type });
  } catch {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
