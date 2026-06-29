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
import { WipeTransitions }     from '@/components/WipeTransitions/WipeTransitions';
import { getFeaturedCategories } from '@/lib/queries/featured';
import { getSiteSettings } from '@/lib/queries/settings';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featured, settings] = await Promise.all([
    getFeaturedCategories(),
    getSiteSettings(),
  ]);
  return (
    <>
      <Suspense><DesignTheme /></Suspense>
      <SnapEnabler />
      <HeroBackground />
      <HeroSection />
      <AboutSection stats={settings.aboutStats} />
      <CategoriesSection />
      <FeaturedSection categories={featured} />
      <PhilosophySection />
      <ContactSection />
      <WipeTransitions />
      <FloatingCTA />
    </>
  );
}
