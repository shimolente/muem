/**
 * Authed admin shell — collapsible sidebar + main content area.
 * Wraps every page under /admin/* EXCEPT /admin/login.
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppSidebar } from '@/components/admin/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  return (
    <SidebarProvider
      style={{
        '--sidebar-width':  'calc(var(--spacing) * 64)',
        '--header-height':  'calc(var(--spacing) * 12)',
      } as React.CSSProperties}
    >
      <AppSidebar
        variant="inset"
        user={{ email: session.user.email, name: session.user.name }}
      />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
