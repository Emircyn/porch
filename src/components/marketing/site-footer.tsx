import Link from "next/link"

import { DemoLink } from "@/components/demo-link"
import { Logo } from "@/components/logo"

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-sm text-muted-foreground">
            A portfolio project by Emircan Erdemci. Payments use Stripe test mode.
          </p>
          <p className="max-w-xl text-xs text-muted-foreground">
            Demo avatars by{" "}
            <a href="https://www.dicebear.com/licenses/" className="underline underline-offset-2 hover:text-foreground">
              DiceBear
            </a>
            : Micah by Micah Lanier, Big Smile by Ashley Seo, Adventurer by Lisa Wischofsky and Personas by Draftbit,
            Croodles by vijay verma and ToonHead by Johan Melin (CC BY 4.0); Avataaars and Open Peeps by Pablo Stanley; Notionists, Lorelei, Pixel Art and Thumbs (CC0).
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex gap-4 text-sm">
            <li>
              <DemoLink className="inline-block py-1.5 hover:underline">
                Demo
              </DemoLink>
            </li>
            <li>
              <Link href="/login" className="inline-block py-1.5 hover:underline">
                Log in
              </Link>
            </li>
            <li>
              <Link href="/signup" className="inline-block py-1.5 hover:underline">
                Sign up
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
