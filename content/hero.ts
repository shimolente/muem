/**
 * Hero section content — CMS-ready.
 * Replace with Supabase fetch when CMS is live.
 */

export interface HeroContent {
  headline:       string;
  label?:         string;   // small uppercase tag above headline
  subline?:       string;
  videoSrc:       string;
  videoPoster?:   string;
  overlayColor:   string;
  overlayOpacity: number; // 0–1
  scrollLabel:    string;
}

export const HERO: HeroContent = {
  headline:       'Roots of luxury',
  videoSrc:       '/video-hero.mp4',
  overlayColor:   '#3A342F',
  overlayOpacity: 0.39,
  scrollLabel:    'Scroll',
  label:          'Create\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Live\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Explore',  // small caption below headline
};
