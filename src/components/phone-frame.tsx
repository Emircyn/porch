import { cn } from "@/lib/utils"

/**
 * iPhone 16 geometry, in points (1 pt = 1 CSS px on the device):
 * - screen 393 × 852 (the Safari viewport), display corner radius 55
 * - bezel 3.25 mm a side: the 65.1 mm wide screen (1179 px at 460 ppi) in a 71.6 mm body, ≈ 19.6 pt
 * - Dynamic Island 126 × 37, 11 from the top
 * The frame's overall 432 × 891 matches Apple's 71.6 × 147.6 mm body (both ≈ 1 : 2.06).
 */
const SCREEN = { width: 393, height: 852, radius: 55 }
const BEZEL = 19.6
const ISLAND = { width: 126, height: 37, top: 11 }
const BODY = { width: SCREEN.width + BEZEL * 2, height: SCREEN.height + BEZEL * 2 }

/**
 * A phone outline for previews. `width` is the frame's width in pixels; everything else is scaled from a real
 * iPhone 16, so the page inside is laid out exactly as it would be on the phone and scrolls within the screen.
 */
export function PhoneFrame({
  children,
  width,
  className,
  label,
}: {
  children: React.ReactNode
  width: number
  className?: string
  label?: string
}) {
  const scale = width / BODY.width
  const px = (points: number) => Math.round(points * scale * 100) / 100

  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      style={{
        width,
        height: px(BODY.height),
        padding: px(BEZEL),
        borderRadius: px(SCREEN.radius + BEZEL),
      }}
      className={cn(
        "relative shrink-0 bg-zinc-900 shadow-[0_30px_60px_-20px_oklch(0.3_0.1_285/0.35)] ring-1 ring-black/10 dark:bg-zinc-800 dark:shadow-[0_30px_80px_-20px_oklch(0.6_0.2_285/0.25)] dark:ring-white/15",
        className
      )}
    >
      <div className="relative h-full overflow-hidden" style={{ borderRadius: px(SCREEN.radius) }}>
        <div
          aria-hidden="true"
          className="absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-black"
          style={{ top: px(ISLAND.top), width: px(ISLAND.width), height: px(ISLAND.height) }}
        />
        <div
          className="overflow-y-auto [scrollbar-width:none]"
          style={{ width: SCREEN.width, height: SCREEN.height, zoom: scale, ["--phone-safe-top" as string]: "24px" }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
