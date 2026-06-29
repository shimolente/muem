import { Skeleton } from '@/components/ui/skeleton';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export default function Loading() {
  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <Skeleton className="h-5 w-24" />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-md border bg-card p-4 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-2/3" />
          </div>
        ))}
      </div>
    </>
  );
}
