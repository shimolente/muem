/**
 * Admin route-group layout.
 * Imports the Tailwind 4 entrypoint (admin.css) — public-site routes never load this.
 * Resets cursor/background overrides from styles/global.css so the admin panel
 * looks like a standard light-mode UI.
 */

import './admin.css';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-admin-shell className="min-h-screen bg-background text-foreground antialiased">
      <TooltipProvider delayDuration={200}>
        {children}
      </TooltipProvider>
      <Toaster richColors closeButton />
    </div>
  );
}
