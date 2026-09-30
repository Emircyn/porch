"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"

function Placeholder() {
  return (
    <div className="rounded-2xl border bg-card p-1.5" role="status" aria-busy="true" aria-label="Loading the editor">
      <div className="h-9" />
      <div className="grid min-h-[40rem] overflow-hidden rounded-xl border bg-background lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex flex-col gap-4 p-6">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-11 w-full rounded-xl" />
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
        <div className="hidden border-l bg-muted/40 p-6 lg:block">
          <Skeleton className="h-[606px] w-[280px] rounded-[3rem]" />
        </div>
      </div>
    </div>
  )
}

// The editor (drag and drop, tabs, dialogs) is the heaviest thing on the landing page. Its code only loads
// once the section is about to scroll into view, so the hero paints and responds first.
const EditorShowcase = dynamic(() => import("./editor-showcase").then((m) => m.EditorShowcase), {
  ssr: false,
  loading: Placeholder,
})

export function LazyEditorShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "400px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref}>{visible ? <EditorShowcase /> : <Placeholder />}</div>
}
