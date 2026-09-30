import { Skeleton } from "@/components/ui/skeleton"

// Shaped like the editor, so the page doesn't jump when it arrives.
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-busy="true" aria-label="Loading your page">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid overflow-hidden rounded-2xl border lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex flex-col gap-5 p-6">
          <div className="flex justify-between">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-11 w-full rounded-xl" />
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
        <div className="hidden border-l bg-muted/40 px-6 py-6 lg:block">
          <Skeleton className="h-[606px] w-[280px] rounded-[3rem]" />
        </div>
      </div>
    </div>
  )
}
