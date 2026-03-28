/**
 * About section content — CMS-ready.
 * Replace with Supabase fetch when CMS is live.
 */

export interface Stat {
  value: string;
  label: string;
}

export interface AboutContent {
  headline: string;
  body:     string;
  stats:    Stat[];
}

export const ABOUT: AboutContent = {
  headline: 'For those who seek\nto create, live and play.',
  body:     'We help the most discerning individuals and brands to cut through complexity, enhance lifestyles and exceed business goals.',
  stats: [
    // TODO: replace with real figures when confirmed
    { value: '12+',  label: 'Years in the industry'  },
    { value: '200+', label: 'Projects delivered'     },
    { value: '5',    label: 'Countries'              },
    { value: '98%',  label: 'Client satisfaction'    },
  ],
};
