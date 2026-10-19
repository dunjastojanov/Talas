import { Skeleton } from './Skeleton'

export function DashboardContentCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-lg border border-blue-800/20 bg-white shadow-sm">
      <Skeleton className="aspect-[16/10] w-full shrink-0 rounded-none" />
      <div className="px-4 py-3">
        <Skeleton className="h-7 w-3/4" />
      </div>
    </article>
  )
}
