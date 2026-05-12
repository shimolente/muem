import Link from 'next/link';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { SiteHeader } from '@/components/admin/site-header';

export const metadata = { title: 'Dashboard' };
export const dynamic  = 'force-dynamic';

async function getCounts() {
  const [projects, properties, furniture, featured, unread, draftProjects, draftProperties, draftFurniture] = await Promise.all([
    prisma.studioProject.count({ where: { deletedAt: null } }),
    prisma.property.count({ where: { deletedAt: null } }),
    prisma.furniture.count({ where: { deletedAt: null } }),
    prisma.featuredSlot.count(),
    prisma.contactSubmission.count({ where: { read: false } }),
    prisma.studioProject.count({ where: { deletedAt: null, publishedAt: null } }),
    prisma.property.count({      where: { deletedAt: null, publishedAt: null } }),
    prisma.furniture.count({     where: { deletedAt: null, publishedAt: null } }),
  ]);
  return { projects, properties, furniture, featured, unread, draftProjects, draftProperties, draftFurniture };
}

export default async function DashboardPage() {
  const c = await getCounts();

  return (
    <>
      <SiteHeader
        title="Dashboard"
        action={
          c.unread > 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/inbox">
                {c.unread} unread {c.unread === 1 ? 'message' : 'messages'}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          )
        }
      />

      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <section className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs *:data-[slot=card]:bg-card sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Studio Projects" value={c.projects}   href="/admin/projects"   drafts={c.draftProjects} />
          <StatCard label="Properties"      value={c.properties} href="/admin/properties" drafts={c.draftProperties} />
          <StatCard label="Furniture"       value={c.furniture}  href="/admin/furniture"  drafts={c.draftFurniture} />
          <StatCard label="Featured Slots"  value={c.featured}   href="/admin/featured"   subtitle="On homepage bento" />
        </section>

        <section className="px-1 md:px-2">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Quick actions</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild><Link href="/admin/projects/new">New Studio Project</Link></Button>
            <Button variant="outline" asChild><Link href="/admin/properties/new">New Property</Link></Button>
            <Button variant="outline" asChild><Link href="/admin/furniture/new">New Furniture</Link></Button>
            <Button variant="outline" asChild><Link href="/admin/featured">Manage Featured</Link></Button>
          </div>
        </section>
      </div>
    </>
  );
}

function StatCard({
  label, value, href, drafts, subtitle,
}: {
  label:    string;
  value:    number;
  href:     string;
  drafts?:  number;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
        {drafts !== undefined && drafts > 0 && (
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="size-3" />
              {drafts} draft{drafts === 1 ? '' : 's'}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <Link href={href} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          {subtitle ?? 'View all →'}
        </Link>
      </CardFooter>
    </Card>
  );
}
