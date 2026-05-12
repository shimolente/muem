'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Check, Trash2, MailOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { markRead, markReplied, deleteSubmission } from '@/server/actions/inbox';

interface Props {
  id:      string;
  email:   string;
  subject: string;
  read:    boolean;
}

export function SubmissionActions({ id, email, subject, read }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onToggleRead = () => {
    startTransition(async () => {
      const res = await markRead(id, !read);
      if (!res.ok) toast.error(res.error);
    });
  };

  const onReplied = () => {
    startTransition(async () => {
      const res = await markReplied(id);
      if (!res.ok) toast.error(res.error);
      else toast.success('Marked as replied');
    });
  };

  const onDelete = () => {
    if (!confirm('Permanently delete this message?')) return;
    startTransition(async () => {
      const res = await deleteSubmission(id);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success('Deleted');
      router.push('/admin/inbox');
      router.refresh();
    });
  };

  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <a href={mailto}>
          <Mail className="size-4" /> Reply
        </a>
      </Button>
      <Button variant="outline" size="sm" disabled={isPending} onClick={onReplied}>
        <Check className="size-4" /> Mark replied
      </Button>
      <Button variant="ghost" size="sm" disabled={isPending} onClick={onToggleRead}>
        {read ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
        {read ? 'Mark unread' : 'Mark read'}
      </Button>
      <Button variant="ghost" size="sm" disabled={isPending} onClick={onDelete}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
