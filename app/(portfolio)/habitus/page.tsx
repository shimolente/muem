import type { Metadata } from 'next';
import { ComingSoon } from '@/components/ComingSoon/ComingSoon';

export const metadata: Metadata = {
  title: 'Lifestyle',
  description: 'Muem Studio furniture collections — coming soon.',
};

export default function HabitusPage() {
  return (
    <div data-palette="furniture">
      <ComingSoon
        eyebrow="Furniture"
        title="Lifestyle"
        imageSrc="/images/habitus-cover.jpg"
      />
    </div>
  );
}
