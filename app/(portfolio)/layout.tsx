import { Cursor } from '@/components/Cursor/Cursor';
import { Navbar } from '@/components/Navbar/Navbar';

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cursor />
      <Navbar />
      <main>{children}</main>
    </>
  );
}
