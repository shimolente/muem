export interface SocialLink {
  label: string;
  href:  string;
}

export interface ContactContent {
  headline:  string;    // '\n' splits into animated lines
  tagline:   string;
  whatsapp:  string;
  email:     string;
  location:  string;
  cta:      { label: string; href: string };
  needs:    string[];
  socials:  SocialLink[];
}

export const CONTACT: ContactContent = {
  headline:  "Let's build\nsomething\nthat lasts.",
  tagline:   "We work with clients who share our belief that architecture is a long-term commitment.",
  whatsapp:  "+34 686 78 35 20",
  email:     "hi@muem.com",
  location:  "Canggu, Bali",
  cta:      { label: "Get in touch", href: "/contact" },
  needs: [
    'Architecture Design',
    'Interior Design',
    'Landscape Design',
    'Renovation & Restoration',
    'Consultation',
    'Other',
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com/muemstudio" },
    { label: "Behance",   href: "https://behance.net/muemstudio"   },
    { label: "LinkedIn",  href: "https://linkedin.com/company/muem" },
  ],
};
