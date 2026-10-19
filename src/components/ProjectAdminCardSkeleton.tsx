import { Skeleton } from './Skeleton'

export function ProjectAdminCardSkeleton() {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded-lg border border-blue-800/20 bg-white shadow-sm sm:min-h-40 sm:flex-row">
      <Skeleton className="h-36 w-full shrink-0 rounded-none sm:h-auto sm:w-44 sm:min-h-40 md:w-52" />
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-7 w-3/4 max-w-xs" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="mt-3 space-y-2 sm:hidden">
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="mt-auto space-y-2 pt-4 sm:space-y-0">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-2 sm:hidden">
            <Skeleton className="h-9 min-w-0 flex-1" />
            <Skeleton className="h-9 min-w-0 flex-1" />
          </div>
          <Skeleton className="ml-auto hidden h-7 w-28 rounded-full sm:block" />
        </div>
      </div>
    </article>
  )
}
