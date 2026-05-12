'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2, Home, Inbox, LayoutDashboard, Sofa, Star, type LucideIcon,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavUser } from './nav-user';

interface NavItem { title: string; url: string; icon: LucideIcon }

const PRIMARY: NavItem[] = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
];

const CONTENT: NavItem[] = [
  { title: 'Studio Projects', url: '/admin/projects',   icon: Building2 },
  { title: 'Properties',      url: '/admin/properties', icon: Home      },
  { title: 'Furniture',       url: '/admin/furniture',  icon: Sofa      },
];

const CURATION: NavItem[] = [
  { title: 'Featured', url: '/admin/featured', icon: Star  },
  { title: 'Inbox',    url: '/admin/inbox',    icon: Inbox },
];

interface Props extends React.ComponentProps<typeof Sidebar> {
  user: { email: string; name?: string | null };
}

export function AppSidebar({ user, ...props }: Props) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/admin/dashboard">
                <span className="text-base font-semibold">Muem CMS</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup items={PRIMARY} />
        <NavGroup label="Content"  items={CONTENT} />
        <NavGroup label="Curation" items={CURATION} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

function NavGroup({ label, items }: { label?: string; items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = pathname === item.url || pathname.startsWith(item.url + '/');
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
