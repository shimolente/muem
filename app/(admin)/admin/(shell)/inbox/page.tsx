import Link from 'next/link';
import { format } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/admin/site-header';
import { SubmissionActions } from './submission-actions';

export const metadata = { title: 'Inbox' };
export const dynamic  = 'force-dynamic';

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const selected = id
    ? submissions.find((s) => s.id === id) ?? null
    : submissions[0] ?? null;

  return (
    <>
    <SiteHeader title="Inbox" />
    <div className="flex flex-1 overflow-hidden">
      {/* ── List pane ─────────────────────────────────────── */}
      <div className="flex w-96 shrink-0 flex-col border-r">
        <header className="border-b px-4 py-4">
          <p className="text-xs text-muted-foreground">
            {submissions.length} total · {submissions.filter((s) => !s.read).length} unread
          </p>
        </header>

        <div className="flex-1 overflow-y-auto">
          {submissions.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">No submissions yet.</p>
          )}

          {submissions.map((s) => (
            <Link
              key={s.id}
              href={`/admin/inbox?id=${s.id}`}
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
              <p className="truncate text-xs text-muted-foreground">{s.lookingFor}</p>
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
                  {selected.email} · {format(selected.createdAt, 'PPpp')}
                </p>
                <div className="mt-2 flex items-center gap-2">
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
