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
          <Skeleton className="h-5 w-28" />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-md border bg-card p-4 space-y-2">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-9 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
