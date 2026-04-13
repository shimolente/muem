export interface SocialLink {
  label: string;
  href:  string;
}

export interface ContactContent {
  headline:  string;
  tagline:   string;
  whatsapp:  string;
  email:     string;
  location:  string;
  cta:      { label: string; href: string };
  needs:    string[];
  socials:  SocialLink[];
}

export const CONTACT: ContactContent = {
  headline:  "Let's create together",
  tagline:   "Looking for a partner for your next project?\n\nLet's discuss your ideas and how to turn them into something real — without overcomplicating it. Coffee helps too.",
  whatsapp:  "+34 686 78 35 20",
  email:     "hi@muem.com",
  location:  "Canggu, Bali",
  cta:      { label: "Get in touch", href: "/contact" },
  needs: [
    'Start a project',
    'Invest / Buy a Property',
    'Collaboration',
    'Other',
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com/muemstudio" },
    { label: "WhatsApp",  href: "https://wa.me/34686783520"         },
  ],
};
