import { defineType, defineField } from 'sanity';

export const residenceProject = defineType({
  name:  'residenceProject',
  title: 'Property',
  type:  'document',
  groups: [
    { name: 'content',       title: 'Content',   default: true },
    { name: 'media',         title: 'Images'    },
    { name: 'specs',         title: 'Specs'     },
    { name: 'availability',  title: 'Availability' },
  ],
  fields: [
    defineField({
      name:  'title',
      title: 'Property Name',
      type:  'string',
      group: 'content',
      validation: r => r.required(),
    }),
    defineField({
      name:  'slug',
      title: 'Slug (URL)',
      type:  'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: r => r.required(),
    }),
    defineField({
      name:  'subtitle',
      title: 'Subtitle / Tagline',
      type:  'string',
      group: 'content',
      description: 'Shown as the large headline on the property detail page.',
    }),
    defineField({
      name:  'description',
      title: 'Description',
      type:  'text',
      rows:  5,
      group: 'content',
    }),
    defineField({
      name:  'images',
      title: 'Images',
      type:  'array',
      of:    [{ type: 'image', options: { hotspot: true } }],
      group: 'media',
      description: 'First image is the cover/hero. Drag to reorder.',
      validation: r => r.required().min(1),
    }),
    defineField({
      name:    'topology',
      title:   'Property Type',
      type:    'string',
      group:   'specs',
      options: {
        list: [
          { title: 'Villa',      value: 'Villa'      },
          { title: 'Apartment',  value: 'Apartment'  },
          { title: 'Townhouse',  value: 'Townhouse'  },
          { title: 'Land',       value: 'Land'       },
          { title: 'Commercial', value: 'Commercial' },
        ],
      },
    }),
    defineField({
      name:  'location',
      title: 'Location',
      type:  'string',
      group: 'specs',
      description: 'e.g. "Seminyak, Bali"',
    }),
    defineField({
      name:  'size',
      title: 'Unit Size',
      type:  'string',
      group: 'specs',
      description: 'e.g. "280 m²"',
    }),
    defineField({
      name:  'priceFrom',
      title: 'Price From',
      type:  'string',
      group: 'specs',
      description: 'e.g. "$420,000"',
    }),
    defineField({
      name:  'bedrooms',
      title: 'Bedrooms',
      type:  'number',
      group: 'specs',
    }),
    defineField({
      name:  'bathrooms',
      title: 'Bathrooms',
      type:  'number',
      group: 'specs',
    }),
    defineField({
      name:  'carPort',
      title: 'Car Port',
      type:  'number',
      group: 'specs',
    }),
    defineField({
      name:  'unitsTotal',
      title: 'Total Units',
      type:  'number',
      group: 'availability',
    }),
    defineField({
      name:  'unitsSold',
      title: 'Units Sold',
      type:  'number',
      group: 'availability',
      initialValue: 0,
    }),
    defineField({
      name:  'year',
      title: 'Year',
      type:  'number',
      group: 'specs',
    }),
  ],
  preview: {
    select: {
      title:    'title',
      location: 'location',
      media:    'images.0',
      sold:     'unitsSold',
      total:    'unitsTotal',
    },
    prepare({ title, location, media, sold, total }) {
      const avail = total != null ? `${total - (sold ?? 0)} / ${total} available` : '';
      return { title, subtitle: [location, avail].filter(Boolean).join(' · '), media };
    },
  },
});
