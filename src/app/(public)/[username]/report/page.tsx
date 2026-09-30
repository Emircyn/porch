import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import * as z from "zod/mini"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { createAnonClient } from "@/lib/public-page"

export const metadata: Metadata = { title: "Report a page", robots: { index: false } }

const reasons = [
  { value: "phishing", label: "It asks for passwords or payment details (phishing)" },
  { value: "impersonation", label: "It pretends to be someone else" },
  { value: "spam", label: "Spam or a scam" },
  { value: "adult", label: "Adult content without a warning" },
  { value: "other", label: "Something else" },
] as const

async function report(formData: FormData) {
  "use server"
  const parsed = z
    .object({
      username: z.string().check(z.minLength(1), z.maxLength(30)),
      reason: z.enum(["phishing", "impersonation", "spam", "adult", "other"]),
      details: z.optional(z.string().check(z.maxLength(500))),
    })
    .safeParse({
      username: formData.get("username"),
      reason: formData.get("reason"),
      details: formData.get("details") || undefined,
    })
  if (!parsed.success) redirect(`/${formData.get("username")}/report?error=1`)
  await createAnonClient().rpc("report_page", {
    page_username: parsed.data.username,
    report_reason: parsed.data.reason,
    report_details: parsed.data.details,
  })
  redirect(`/${parsed.data.username}/report?sent=1`)
}

// A plain form and a server action: works without JavaScript, like the rest of the public side.
export default async function ReportPage({ params, searchParams }: PageProps<"/[username]/report">) {
  const { username } = await params
  const { sent, error } = await searchParams

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-8 bg-background px-5 py-12 font-sans text-foreground">
      <Link href="/" className="w-fit rounded-lg">
        <Logo />
      </Link>
      {sent ? (
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold">Thanks, we got it</h1>
          <p className="text-muted-foreground">
            We review every report. If the page breaks the rules, it comes down.
          </p>
          <Button asChild variant="outline" className="w-fit">
            <Link href={`/${username}`}>Back to the page</Link>
          </Button>
        </div>
      ) : (
        <form action={report} className="flex flex-col gap-6">
          <input type="hidden" name="username" value={username} />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Report @{username}</h1>
            <p className="text-sm text-muted-foreground">
              Tell us what is wrong with this page. Reports are anonymous.
            </p>
          </div>
          {error ? (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              Pick a reason, then send the report again.
            </p>
          ) : null}
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">What is the problem?</legend>
            {reasons.map((reason) => (
              <label
                key={reason.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <input type="radio" name="reason" value={reason.value} required className="accent-primary" />
                {reason.label}
              </label>
            ))}
          </fieldset>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Anything else we should know? <span className="font-normal text-muted-foreground">(optional)</span>
            <textarea
              name="details"
              rows={3}
              maxLength={500}
              className="rounded-lg border bg-transparent px-3 py-2 font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
          </label>
          <Button type="submit" size="lg">
            Send report
          </Button>
        </form>
      )}
    </main>
  )
}
