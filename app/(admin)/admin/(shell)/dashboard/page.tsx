import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
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

function getRecentSubmissions() {
  return prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
  });
}

export default async function DashboardPage() {
  const [c, recent] = await Promise.all([getCounts(), getRecentSubmissions()]);

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

        <section>
          <Card>
            <CardHeader>
              <CardDescription>Recent submissions</CardDescription>
              <CardTitle className="text-base font-medium">Contact form &amp; developer requests</CardTitle>
              <CardAction>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/inbox">View inbox <ArrowUpRight className="size-4" /></Link>
                </Button>
              </CardAction>
            </CardHeader>
            <div className="px-6 pb-4">
              {recent.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">No submissions yet.</p>
              ) : (
                <ul className="divide-y">
                  {recent.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/admin/inbox?id=${s.id}`}
                        className="flex items-center gap-3 py-2.5 text-sm transition-colors hover:text-foreground"
                      >
                        <span className={cn('w-40 shrink-0 truncate', !s.read && 'font-semibold')}>
                          {s.name}
                        </span>
                        {s.kind === 'DEVELOPER'
                          ? <Badge variant="secondary" className="shrink-0">Developer</Badge>
                          : <Badge variant="outline" className="shrink-0">Form</Badge>}
                        <span className="flex-1 truncate text-muted-foreground">
                          {s.kind === 'DEVELOPER' ? (s.propertyTitle ?? s.lookingFor) : s.lookingFor}
                        </span>
                        {!s.read && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {format(s.createdAt, 'MMM d')}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
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
