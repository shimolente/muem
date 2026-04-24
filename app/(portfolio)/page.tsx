import { Suspense }             from 'react';
import { HeroBackground }      from '@/components/HeroBackground/HeroBackground';
import { HeroSection }         from '@/components/HeroSection/HeroSection';
import { AboutSection }        from '@/components/AboutSection/AboutSection';
import { CategoriesSection }   from '@/components/CategoriesSection/CategoriesSection';
import { FeaturedSection }     from '@/components/FeaturedSection/FeaturedSection';
import { PhilosophySection }   from '@/components/PhilosophySection/PhilosophySection';
import { ContactSection }      from '@/components/ContactSection/ContactSection';
import { FloatingCTA }         from '@/components/FloatingCTA/FloatingCTA';
import { SnapEnabler }         from '@/components/SnapEnabler/SnapEnabler';
import { DesignTheme }         from '@/components/DesignTheme/DesignTheme';

/**
 * Homepage — sections stack on the root scroll.
 * Lenis (LenisProvider) smooths the scroll.
 * SectionSnap intercepts wheel events and snaps between [data-snap-section] elements.
 * HeroBackground sits fixed behind everything.
 * DesignTheme reads ?design=v1|v2 and applies data-design to <html>.
 */
export default function HomePage() {
  return (
    <>
      <Suspense><DesignTheme /></Suspense>
      <SnapEnabler />
      <HeroBackground />
      <HeroSection />
      <AboutSection />
      <CategoriesSection />
      <FeaturedSection />
      <PhilosophySection />
      <ContactSection />
      <FloatingCTA />
    </>
  );
}
