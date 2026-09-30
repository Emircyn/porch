import Link from "next/link"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

// Someone typed or followed an address nobody has claimed yet; point them at claiming it.
export default function PageNotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-5 text-center font-sans text-foreground">
      <Logo />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Nobody lives here yet</h1>
        <p className="max-w-sm text-muted-foreground">
          This address is free. It could be your page in about a minute.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/signup">Claim it</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">What is Porch?</Link>
        </Button>
      </div>
    </main>
  )
}
