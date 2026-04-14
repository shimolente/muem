import { defineType, defineField } from 'sanity';

export const studioProject = defineType({
  name:  'studioProject',
  title: 'Studio Project',
  type:  'document',
  groups: [
    { name: 'content',  title: 'Content',  default: true },
    { name: 'media',    title: 'Images'  },
    { name: 'metadata', title: 'Metadata' },
  ],
  fields: [
    defineField({
      name:  'title',
      title: 'Project Name',
      type:  'string',
      group: 'content',
      validation: r => r.required(),
    }),
    defineField({
      name:  'slug',
      title: 'Slug (URL)',
      type:  'slug',
      group: 'metadata',
      options: { source: 'title', maxLength: 96 },
      validation: r => r.required(),
    }),
    defineField({
      name:  'subtitle',
      title: 'Subtitle / Tagline',
      type:  'string',
      group: 'content',
      description: 'Short tagline shown on the detail page hero.',
    }),
    defineField({
      name:  'description',
      title: 'Description',
      type:  'text',
      rows:  4,
      group: 'content',
    }),
    defineField({
      name:  'images',
      title: 'Images',
      type:  'array',
      of:    [{ type: 'image', options: { hotspot: true } }],
      group: 'media',
      description: 'First image is used as the cover/hero. Drag to reorder.',
      validation: r => r.required().min(1),
    }),
    defineField({
      name:    'category',
      title:   'Category',
      type:    'string',
      group:   'metadata',
      options: {
        list: [
          { title: 'Residential', value: 'Residential' },
          { title: 'Hospitality', value: 'Hospitality' },
          { title: 'Commercial',  value: 'Commercial'  },
          { title: 'F&B',         value: 'F&B'         },
          { title: 'Retail',      value: 'Retail'      },
        ],
      },
    }),
    defineField({
      name:  'topology',
      title: 'Topology (sub-type)',
      type:  'string',
      group: 'metadata',
      description: 'e.g. "Villa", "Restaurant", "Hotel Lobby"',
    }),
    defineField({
      name:  'location',
      title: 'Location',
      type:  'string',
      group: 'metadata',
    }),
    defineField({
      name:  'size',
      title: 'Size',
      type:  'string',
      group: 'metadata',
      description: 'e.g. "320 m²"',
    }),
    defineField({
      name:  'year',
      title: 'Year',
      type:  'number',
      group: 'metadata',
    }),
    defineField({
      name:    'status',
      title:   'Status',
      type:    'string',
      group:   'metadata',
      options: {
        list: [
          { title: 'Completed',    value: 'Completed'    },
          { title: 'In Progress',  value: 'In Progress'  },
          { title: 'Concept',      value: 'Concept'      },
        ],
      },
      initialValue: 'Completed',
    }),
    defineField({
      name:  'featured',
      title: 'Featured on homepage?',
      type:  'boolean',
      group: 'metadata',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title:    'title',
      location: 'location',
      year:     'year',
      media:    'images.0',
    },
    prepare({ title, location, year, media }) {
      return {
        title,
        subtitle: [location, year].filter(Boolean).join(' · '),
        media,
      };
    },
  },
});
