import { defineType, defineField } from 'sanity';

export const landingPage = defineType({
  name:  'landingPage',
  title: 'Landing Page',
  type:  'document',
  // Singleton — only one document of this type
  groups: [
    { name: 'hero',        title: 'Hero',        default: true },
    { name: 'featured',    title: 'Featured'    },
    { name: 'about',       title: 'About'       },
    { name: 'philosophy',  title: 'Philosophy'  },
    { name: 'categories',  title: 'Categories'  },
  ],
  fields: [
    /* ── Hero ─────────────────────────────────────────────────────────────── */
    defineField({
      name:  'heroHeadline',
      title: 'Hero Headline',
      type:  'string',
      group: 'hero',
      description: 'Use \\n for line breaks.',
    }),
    defineField({
      name:  'heroTagline',
      title: 'Hero Tagline',
      type:  'string',
      group: 'hero',
    }),
    defineField({
      name:  'heroVideo',
      title: 'Hero Background Video URL',
      type:  'url',
      group: 'hero',
      description: 'Direct video URL (mp4). Leave blank to use the static image.',
    }),
    defineField({
      name:  'heroImage',
      title: 'Hero Background Image (fallback)',
      type:  'image',
      group: 'hero',
      options: { hotspot: true },
    }),

    /* ── Featured projects ─────────────────────────────────────────────────── */
    defineField({
      name:  'featuredProjects',
      title: 'Featured Projects (homepage showcase)',
      type:  'array',
      of:    [{ type: 'reference', to: [{ type: 'studioProject' }] }],
      group: 'featured',
      description: 'These appear in the homepage featured section. Max 6.',
      validation: r => r.max(6),
    }),

    /* ── About section ─────────────────────────────────────────────────────── */
    defineField({
      name:  'aboutHeadline',
      title: 'About Headline',
      type:  'string',
      group: 'about',
    }),
    defineField({
      name:  'aboutBody',
      title: 'About Body',
      type:  'text',
      rows:  4,
      group: 'about',
    }),
    defineField({
      name:  'aboutImage',
      title: 'About Image',
      type:  'image',
      group: 'about',
      options: { hotspot: true },
    }),

    /* ── Philosophy section ────────────────────────────────────────────────── */
    defineField({
      name:  'philosophyHeadline',
      title: 'Philosophy Headline',
      type:  'string',
      group: 'philosophy',
    }),
    defineField({
      name:  'philosophyPoints',
      title: 'Philosophy Points',
      type:  'array',
      of:    [{
        type: 'object',
        fields: [
          { name: 'number', title: 'Number', type: 'string' },
          { name: 'label',  title: 'Label',  type: 'string' },
          { name: 'body',   title: 'Body',   type: 'text'   },
        ],
        preview: {
          select: { title: 'label', subtitle: 'number' },
        },
      }],
      group: 'philosophy',
    }),

    /* ── Categories section ────────────────────────────────────────────────── */
    defineField({
      name:  'categories',
      title: 'Category Cards (Studio / Lifestyle / Properties)',
      type:  'array',
      of:    [{
        type: 'object',
        fields: [
          { name: 'id',     title: 'ID',    type: 'string'   },
          { name: 'label',  title: 'Label', type: 'string'   },
          { name: 'name',   title: 'Name',  type: 'string'   },
          { name: 'body',   title: 'Body',  type: 'text'     },
          { name: 'cta',    title: 'CTA',   type: 'string'   },
          { name: 'ctaHref', title: 'CTA URL', type: 'string' },
          { name: 'image',  title: 'Image', type: 'image', options: { hotspot: true } },
        ],
        preview: {
          select: { title: 'name', media: 'image' },
        },
      }],
      group: 'categories',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Landing Page' };
    },
  },
});
