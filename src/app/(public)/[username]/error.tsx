"use client"

// A public page couldn't be loaded (usually the database). Visitors get a calm, plain message.
export default function PublicPageError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-5 text-center font-sans text-foreground">
      <h1 className="text-xl font-semibold">This page is taking a break</h1>
      <p className="max-w-sm text-muted-foreground">It couldn&apos;t load just now. Try again in a moment.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        Try again
      </button>
    </main>
  )
}
