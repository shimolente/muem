import Link from 'next/link';
import { format } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/admin/site-header';
import { SubmissionActions } from './submission-actions';

export const metadata = { title: 'Inbox' };
export const dynamic  = 'force-dynamic';

const FILTERS = [
  { label: 'All',       value: undefined,    kind: undefined },
  { label: 'Form',      value: 'general',    kind: 'GENERAL'   as const },
  { label: 'Developer', value: 'developer',  kind: 'DEVELOPER' as const },
];

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; kind?: string }>;
}) {
  const { id, kind } = await searchParams;
  const kindFilter =
    kind === 'developer' ? ('DEVELOPER' as const)
    : kind === 'general' ? ('GENERAL' as const)
    : undefined;

  const [submissions, genCount, devCount] = await Promise.all([
    prisma.contactSubmission.findMany({
      where:   kindFilter ? { kind: kindFilter } : undefined,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contactSubmission.count({ where: { kind: 'GENERAL' } }),
    prisma.contactSubmission.count({ where: { kind: 'DEVELOPER' } }),
  ]);
  const counts: Record<string, number> = {
    all: genCount + devCount,
    general: genCount,
    developer: devCount,
  };

  const selected = id
    ? submissions.find((s) => s.id === id) ?? null
    : submissions[0] ?? null;

  // Preserve the active filter when selecting a message.
  const itemHref = (sid: string) => `/admin/inbox?id=${sid}${kind ? `&kind=${kind}` : ''}`;

  return (
    <>
    <SiteHeader title="Inbox" />
    <div className="flex flex-1 overflow-hidden">
      {/* ── List pane ─────────────────────────────────────── */}
      <div className="flex w-96 shrink-0 flex-col border-r">
        <header className="border-b px-4 py-4">
          <div className="mb-3 flex items-center gap-1 rounded-md bg-muted p-1">
            {FILTERS.map((f) => {
              const active = f.value === kind || (!f.value && !kind);
              return (
                <Link
                  key={f.label}
                  href={f.value ? `/admin/inbox?kind=${f.value}` : '/admin/inbox'}
                  className={cn(
                    'flex-1 rounded-sm px-2 py-1 text-center text-xs font-medium transition-colors',
                    active ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {f.label}
                  <span className="ml-1 tabular-nums opacity-60">
                    {counts[f.value ?? 'all']}
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {submissions.length} shown · {submissions.filter((s) => !s.read).length} unread
          </p>
        </header>

        <div className="flex-1 overflow-y-auto">
          {submissions.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">No submissions yet.</p>
          )}

          {submissions.map((s) => (
            <Link
              key={s.id}
              href={itemHref(s.id)}
              className={cn(
                'block border-b px-4 py-3 transition-colors hover:bg-accent/50',
                selected?.id === s.id && 'bg-accent',
                !s.read && 'bg-muted/30',
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className={cn('truncate text-sm', !s.read && 'font-semibold')}>
                  {s.name}
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {format(s.createdAt, 'MMM d')}
                </span>
              </div>
              <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                {s.kind === 'DEVELOPER' && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">Developer</Badge>
                )}
                <span className="truncate">{s.kind === 'DEVELOPER' ? (s.propertyTitle ?? s.lookingFor) : s.lookingFor}</span>
              </p>
              <p className="line-clamp-2 mt-1 text-xs text-muted-foreground">{s.message}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Detail pane ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col">
        {!selected ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            No message selected.
          </div>
        ) : (
          <>
            <header className="flex items-start justify-between gap-4 border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {selected.email}
                  {selected.phone && <> · {selected.phone}</>}
                  {' · '}{format(selected.createdAt, 'PPpp')}
                </p>
                {selected.kind === 'DEVELOPER' && selected.propertyTitle && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Property:{' '}
                    {selected.propertySlug ? (
                      <Link
                        href={`/residences/${selected.propertySlug}`}
                        className="underline underline-offset-4 hover:text-foreground"
                        target="_blank"
                      >
                        {selected.propertyTitle}
                      </Link>
                    ) : (
                      selected.propertyTitle
                    )}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  {selected.kind === 'DEVELOPER' && <Badge>Developer</Badge>}
                  <Badge variant="outline">{selected.lookingFor}</Badge>
                  {selected.repliedAt ? (
                    <Badge>Replied</Badge>
                  ) : selected.read ? (
                    <Badge variant="secondary">Read</Badge>
                  ) : (
                    <Badge>New</Badge>
                  )}
                </div>
              </div>
              <SubmissionActions
                id={selected.id}
                email={selected.email}
                subject={`Re: Inquiry from ${selected.name}`}
                read={selected.read}
              />
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="whitespace-pre-wrap text-sm">{selected.message}</div>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
