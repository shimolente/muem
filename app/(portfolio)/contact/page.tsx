import type { Metadata } from 'next';
import { ContactSection } from '@/components/ContactSection/ContactSection';

export const metadata: Metadata = {
  title: "Let's Talk",
  description: "Get in touch with Muem Studio — tell us about your project and let's start the conversation.",
};

export default function ContactPage() {
  return <ContactSection isPage />;
}
