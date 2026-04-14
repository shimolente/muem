/**
 * Sanity client + GROQ query functions.
 *
 * Environment variables (set in .env.local and Vercel dashboard):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID  — from sanity.io/manage
 *   NEXT_PUBLIC_SANITY_DATASET     — "production" (default)
 *   SANITY_API_TOKEN               — read-only token for ISR / SSR fetches
 */

import { createClient } from 'next-sanity';
import type { StudioProject }    from '@/content/studio';
import type { ResidenceProject } from '@/content/residences';
import type { FurnitureItem }    from '@/content/furniture';

/* ── Client ─────────────────────────────────────────────────────────────────── */
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'REPLACE_ME',
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET    ?? 'production',
  apiVersion: '2024-01-01',
  useCdn:     process.env.NODE_ENV === 'production',
  token:      process.env.SANITY_API_TOKEN, // needed for draft-mode / ISR revalidation
});

/* ── Image reference helper ──────────────────────────────────────────────────── */
// Used inside GROQ projections to extract a CDN URL from a Sanity image reference.
// Full builder lives in lib/image.ts — use that for rendering.
const IMAGE_PROJECTION = `"src": asset->url`;

/* ── Studio projects ─────────────────────────────────────────────────────────── */
export async function getStudioProjects(): Promise<StudioProject[]> {
  return sanityClient.fetch(
    `*[_type == "studioProject"] | order(year desc) {
      "id":        _id,
      title,
      "href":      "/studio/" + slug.current,
      year,
      location,
      size,
      topology,
      status,
      featured,
      subtitle,
      description,
      "images": images[].asset->url
    }`,
  );
}

export async function getStudioProject(slug: string): Promise<StudioProject | null> {
  return sanityClient.fetch(
    `*[_type == "studioProject" && slug.current == $slug][0] {
      "id":        _id,
      title,
      "href":      "/studio/" + slug.current,
      year,
      location,
      size,
      topology,
      status,
      featured,
      subtitle,
      description,
      "images": images[].asset->url
    }`,
    { slug },
  );
}

export async function getStudioSlugs(): Promise<{ slug: string }[]> {
  return sanityClient.fetch(
    `*[_type == "studioProject"]{ "slug": slug.current }`,
  );
}

/* ── Residence projects ──────────────────────────────────────────────────────── */
export async function getResidenceProjects(): Promise<ResidenceProject[]> {
  return sanityClient.fetch(
    `*[_type == "residenceProject"] | order(year desc) {
      "id":         _id,
      title,
      "href":       "/residences/" + slug.current,
      topology,
      location,
      size,
      priceFrom,
      unitsTotal,
      unitsSold,
      bedrooms,
      bathrooms,
      carPort,
      year,
      subtitle,
      description,
      "images": images[].asset->url
    }`,
  );
}

export async function getResidenceProject(slug: string): Promise<ResidenceProject | null> {
  return sanityClient.fetch(
    `*[_type == "residenceProject" && slug.current == $slug][0] {
      "id":         _id,
      title,
      "href":       "/residences/" + slug.current,
      topology,
      location,
      size,
      priceFrom,
      unitsTotal,
      unitsSold,
      bedrooms,
      bathrooms,
      carPort,
      year,
      subtitle,
      description,
      "images": images[].asset->url
    }`,
    { slug },
  );
}

export async function getResidenceSlugs(): Promise<{ slug: string }[]> {
  return sanityClient.fetch(
    `*[_type == "residenceProject"]{ "slug": slug.current }`,
  );
}

/* ── Furniture items ─────────────────────────────────────────────────────────── */
export async function getFurnitureItems(): Promise<FurnitureItem[]> {
  return sanityClient.fetch(
    `*[_type == "furnitureItem"] | order(_createdAt asc) {
      "id":       _id,
      name,
      "href":     "/habitus/" + slug.current,
      collection,
      category,
      material,
      price,
      featured,
      "images": images[].asset->url
    }`,
  );
}
