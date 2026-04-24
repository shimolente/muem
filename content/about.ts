/**
 * About section content — CMS-ready.
 * Replace with Supabase fetch when CMS is live.
 */

export interface Stat {
  value:  string;
  label:  string;
  tags:   string[];
}

export interface AboutContent {
  headline: string;
  body:     string;
  stats:    Stat[];
}

export const ABOUT: AboutContent = {
  headline: 'Less talk.\nMore design.',
  body:     '',
  stats: [
    {
      value: '3+',
      label: 'Expertise',
      tags:  ['Architecture', 'Furniture', 'Real Estate'],
    },
    {
      value: '30+',
      label: 'Projects',
      tags:  ['Residential', 'Hospitality', 'Commercial'],
    },
    {
      value: '15k+',
      label: 'Designed m²',
      tags:  ['Rootedness', 'Sustainability', 'Refinement'],
    },
    {
      value: '10+',
      label: 'Years',
      tags:  ['International', 'Experience'],
    },
  ],
};
