"use client"

import { useSyncExternalStore, type ComponentPropsWithoutRef } from "react"

const noSubscribe = () => () => {}

import { cn } from "@/lib/utils"

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  // The server sends one copy; the loop copies are added in the browser, which keeps the HTML (and the work a
  // free Worker does to serve it) small. The strip sits below the fold, so the copies are there before it shows.
  const inBrowser = useSyncExternalStore(noSubscribe, () => true, () => false)
  const copies = inBrowser ? repeat : 1

  return (
    <div
      {...props}
      className={cn(
        "group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array(copies)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            // Copies after the first exist only for the loop; screen readers read the content once.
            aria-hidden={i > 0 ? true : undefined}
            // …and they can't be tabbed into either.
            inert={i > 0 ? true : undefined}
            className={cn("flex shrink-0 justify-around gap-(--gap)", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  )
}
