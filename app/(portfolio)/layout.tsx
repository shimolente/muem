import { Cursor }        from '@/components/Cursor/Cursor';
import { Navbar }        from '@/components/Navbar/Navbar';
import { LenisProvider } from '@/components/LenisProvider/LenisProvider';
import { Preloader }     from '@/components/Preloader/Preloader';

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Preloader />
      <LenisProvider />
      <Cursor />
      <Navbar />
      <main>{children}</main>
    </>
  );
}
