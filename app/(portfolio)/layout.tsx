import { Cursor }        from '@/components/Cursor/Cursor';
import { Navbar }        from '@/components/Navbar/Navbar';
import { LenisProvider } from '@/components/LenisProvider/LenisProvider';

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LenisProvider />
      <Cursor />
      <Navbar />
      <main>{children}</main>
    </>
  );
}
