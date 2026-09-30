"use client"

import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"

function EditorSkeleton() {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto]"
      role="status"
      aria-busy="true"
      aria-label="Loading the editor"
    >
      <div className="flex flex-col gap-5 p-4 sm:p-6">
        <div className="flex justify-between">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-8 w-32" />
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
  )
}

/**
 * The editor renders in the browser only. It is the heaviest tree in the app (drag and drop, tabs, dialogs),
 * and rendering it on the server for every dashboard visit cost more CPU than a free Worker allows. The page
 * sits behind a login, so nothing is lost for search engines.
 */
export const LazyEditor = dynamic(() => import("./editor").then((m) => m.Editor), {
  ssr: false,
  loading: EditorSkeleton,
})
