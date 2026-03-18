export interface SocialLink {
  label: string;
  href:  string;
}

export interface ContactContent {
  headline: string;    // '\n' splits into animated lines
  tagline:  string;
  cta:      { label: string; href: string };
  socials:  SocialLink[];
}

export const CONTACT: ContactContent = {
  headline: "Let's build\nsomething\nthat lasts.",
  tagline:  "We work with clients who share our belief that architecture is a long-term commitment.",
  cta:      { label: "Get in touch", href: "/contact" },
  socials:  [
    { label: "Instagram", href: "https://instagram.com/muemstudio" },
    { label: "Behance",   href: "https://behance.net/muemstudio"   },
    { label: "LinkedIn",  href: "https://linkedin.com/company/muem" },
  ],
};
