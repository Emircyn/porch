"use client"

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

// Something failed on the server (a timeout, the database). Say so plainly and offer the way back.
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-24">
      <Empty className="max-w-md">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlertIcon />
          </EmptyMedia>
          <EmptyTitle>This page didn&apos;t load</EmptyTitle>
          <EmptyDescription>
            Something went wrong on our side, not yours. Try again; if it keeps happening, come back in a few
            minutes.
            {error.digest ? <span className="mt-2 block font-mono text-xs">Reference: {error.digest}</span> : null}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button onClick={reset}>
            <RotateCcwIcon /> Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}
