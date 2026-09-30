import { ChevronRightIcon, CircleCheckIcon } from "lucide-react"
import Link from "next/link"

import { ClaimForm } from "@/components/marketing/claim-form"
import { Faq } from "@/components/marketing/faq"
import { FeatureBento } from "@/components/marketing/feature-bento"
import { Pricing } from "@/components/marketing/pricing"
import { LazyEditorShowcase } from "@/components/marketing/lazy-editor-showcase"
import { HeroPhone } from "@/components/marketing/hero-phone"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import { ThemeMarquee } from "@/components/marketing/theme-marquee"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { FREE_LINK_LIMIT, PRO_PRICE_USD } from "@/lib/plans"
import { themes } from "@/lib/themes"

// One orchestrated entrance for the hero, in CSS so the text paints before any JavaScript runs.
const enter = "animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-700 motion-reduce:animate-none"

function SectionHeading({ id, title, body }: { id: string; title: string; body: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
      <h2 id={id} className="text-3xl font-semibold sm:text-5xl">
        {title}
      </h2>
      <p className="text-lg text-muted-foreground">{body}</p>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-dots [mask-image:radial-gradient(ellipse_60%_70%_at_70%_40%,black,transparent)]"
          />

          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-5 pt-14 pb-24 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pt-20 lg:pb-32">
            <div className="flex flex-col items-start">
              <Link
                href="#editor"
                className={`${enter} group mb-6 inline-flex items-center rounded-full border bg-card/80 py-1 pr-1 pl-3 text-sm shadow-xs backdrop-blur transition-colors hover:border-primary/40`}
              >
                <AnimatedShinyText className="mx-0 max-w-none">Try the editor, no sign-up</AnimatedShinyText>
                <span className="ml-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <ChevronRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <h1
                className="text-5xl leading-[1.02] font-semibold tracking-tighter sm:text-6xl lg:text-[4.25rem]"
              >
                One link for everything you make
              </h1>
              <p
                className={`${enter} mt-6 max-w-lg text-lg text-muted-foreground [--tw-animation-delay:160ms] sm:text-xl`}
              >
                Your photo, your links and a theme you like, on one page that looks right on every phone. Share it
                in your bio, on your card, anywhere.
              </p>
              <ClaimForm id="claim-hero" className={`${enter} mt-8 [--tw-animation-delay:240ms]`} />
              <ul
                className={`${enter} mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground [--tw-animation-delay:300ms]`}
              >
                {[`Free for ${FREE_LINK_LIMIT} links`, "Live preview as you edit", "Dark mode built in"].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <CircleCheckIcon className="size-4 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`${enter} [--tw-animation-delay:200ms]`}>
              <HeroPhone />
            </div>
          </div>
        </section>

        <section
          id="editor"
          aria-labelledby="editor-heading"
          className="scroll-mt-20 border-y bg-muted/30 px-5 py-24 sm:px-8 sm:py-28"
        >
          <SectionHeading
            id="editor-heading"
            title="Go on, try the editor"
            body="This is the real thing, running on Maya's demo page. Drag links, switch themes, open the stats. Nothing is saved."
          />
          <div className="mx-auto mt-14 max-w-6xl">
            <LazyEditorShowcase />
          </div>
        </section>

        <section
          id="features"
          aria-labelledby="features-heading"
          className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32"
        >
          <SectionHeading
            id="features-heading"
            title="Everything your bio link needs"
            body="A page that looks good on every phone, is quick to edit and tells you what people tap."
          />
          <div className="mt-14">
            <FeatureBento />
          </div>
        </section>

        <section
          id="themes"
          aria-labelledby="themes-heading"
          className="scroll-mt-20 border-y bg-muted/30 py-24 [contain-intrinsic-size:auto_900px] [content-visibility:auto] sm:py-32"
        >
          <div className="px-5 sm:px-8">
            <SectionHeading
              id="themes-heading"
              title={`${themes.length} themes, one tap apart`}
              body="Three come free. Pro unlocks the rest, and you can switch whenever you like."
            />
          </div>
          <div className="mt-14">
            <ThemeMarquee />
          </div>
        </section>

        <section
          id="pricing"
          aria-labelledby="pricing-heading"
          className="mx-auto w-full max-w-4xl scroll-mt-20 px-5 py-24 [contain-intrinsic-size:auto_800px] [content-visibility:auto] sm:px-8 sm:py-32"
        >
          <SectionHeading
            id="pricing-heading"
            title="Simple pricing"
            body={`Start free. Upgrade to Pro for $${PRO_PRICE_USD} a month when you want more.`}
          />
          <div className="mt-14">
            <Pricing />
          </div>
        </section>

        <section
          id="faq"
          aria-labelledby="faq-heading"
          className="mx-auto w-full max-w-3xl scroll-mt-20 px-5 pb-24 [contain-intrinsic-size:auto_700px] [content-visibility:auto] sm:px-8 sm:pb-32"
        >
          <SectionHeading
            id="faq-heading"
            title="Questions"
            body="The short answers. Anything else, the demo account is one click away."
          />
          <div className="mt-10">
            <Faq />
          </div>
        </section>

        <section aria-labelledby="cta-heading" className="px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="relative isolate mx-auto flex w-full max-w-5xl flex-col items-center overflow-hidden rounded-3xl border bg-card px-6 py-16 text-center sm:py-20">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-dots opacity-70" />
            <div
              aria-hidden="true"
              className="absolute -bottom-40 left-1/2 -z-10 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-brand-glow blur-3xl"
            />
            <h2 id="cta-heading" className="max-w-xl text-3xl font-semibold sm:text-5xl">
              Claim your name before someone else does
            </h2>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              It takes a minute. Finish your page whenever you are ready.
            </p>
            <ClaimForm id="claim-footer" className="mt-8" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
