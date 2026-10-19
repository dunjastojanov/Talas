import { Skeleton } from './Skeleton'

type AdminProjectEditPageSkeletonProps = {
  showDates?: boolean
}

export function AdminProjectEditPageSkeleton({ showDates = true }: AdminProjectEditPageSkeletonProps) {
  return (
    <main className="pb-6" aria-busy="true">
      <Skeleton className="h-48 w-full rounded-none sm:h-72" />

      <div className="mx-auto mt-4 flex w-full max-w-5xl justify-end px-4">
        <Skeleton className="h-9 w-[7.25rem] rounded-md" />
      </div>

      <div className="mx-auto mt-6 w-full max-w-5xl space-y-4 px-4">
        {showDates ? (
          <div className="rounded-md border border-blue-800/10 bg-blue-800/5 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : null}

        <div className="space-y-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-5xl space-y-4 px-4">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-36 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
        <div className="rounded-lg border border-blue-800/20 p-4">
          <Skeleton className="mb-2 ml-auto h-9 w-20 rounded-md" />
          <Skeleton className="h-10 w-full max-w-xs rounded-md" />
          <Skeleton className="mt-3 h-32 w-full rounded-md" />
        </div>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-5xl justify-end gap-2 px-4">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    </main>
  )
}
