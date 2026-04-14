import { defineType, defineField } from 'sanity';

export const furnitureItem = defineType({
  name:  'furnitureItem',
  title: 'Lifestyle / Furniture',
  type:  'document',
  groups: [
    { name: 'content',  title: 'Content',  default: true },
    { name: 'media',    title: 'Images'   },
    { name: 'metadata', title: 'Metadata' },
  ],
  fields: [
    defineField({
      name:  'name',
      title: 'Product Name',
      type:  'string',
      group: 'content',
      validation: r => r.required(),
    }),
    defineField({
      name:  'slug',
      title: 'Slug (URL)',
      type:  'slug',
      group: 'metadata',
      options: { source: 'name', maxLength: 96 },
      validation: r => r.required(),
    }),
    defineField({
      name:  'collection',
      title: 'Collection',
      type:  'string',
      group: 'content',
      description: 'e.g. "Oakwood Series"',
    }),
    defineField({
      name:    'category',
      title:   'Category',
      type:    'string',
      group:   'metadata',
      options: {
        list: [
          { title: 'Chairs',    value: 'Chairs'    },
          { title: 'Tables',    value: 'Tables'    },
          { title: 'Consoles',  value: 'Consoles'  },
          { title: 'Shelving',  value: 'Shelving'  },
          { title: 'Sofas',     value: 'Sofas'     },
          { title: 'Extras',    value: 'Extras'    },
        ],
      },
      validation: r => r.required(),
    }),
    defineField({
      name:  'material',
      title: 'Material',
      type:  'string',
      group: 'content',
      description: 'e.g. "Charter Wood", "Polished Concrete"',
    }),
    defineField({
      name:  'price',
      title: 'Price',
      type:  'string',
      group: 'content',
      description: 'Formatted string e.g. "$4,200"',
    }),
    defineField({
      name:  'images',
      title: 'Images',
      type:  'array',
      of:    [{ type: 'image', options: { hotspot: true } }],
      group: 'media',
      description: 'First image is the cover. Drag to reorder.',
      validation: r => r.required().min(1),
    }),
    defineField({
      name:  'featured',
      title: 'Featured (spans 2 columns in grid)?',
      type:  'boolean',
      group: 'metadata',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title:    'name',
      category: 'category',
      price:    'price',
      media:    'images.0',
    },
    prepare({ title, category, price, media }) {
      return { title, subtitle: [category, price].filter(Boolean).join(' · '), media };
    },
  },
});
