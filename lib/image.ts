/**
 * Sanity image URL builder.
 *
 * Usage:
 *   import { urlFor } from '@/lib/image';
 *   <Image src={urlFor(project.coverImage).width(1200).url()} ... />
 *
 * The `source` argument can be a Sanity image reference object or a plain URL string.
 * When it's a plain string (e.g. during the hardcoded-content transition period),
 * the string is returned as-is so existing /images/*.jpg paths keep working.
 */

import imageUrlBuilder from '@sanity/image-url';
import { sanityClient } from './sanity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImageSource = any;

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource | string) {
  if (typeof source === 'string') {
    // Plain URL — return a minimal object with `.url()` so call sites are consistent
    return { url: () => source, width: () => ({ url: () => source }) };
  }
  return builder.image(source);
}
