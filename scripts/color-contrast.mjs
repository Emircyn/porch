// Minimal colour maths for the theme importer: parse CSS colours, measure WCAG contrast, nudge OKLCH lightness.

export function parseColor(value) {
  const v = value.trim()
  let m
  if ((m = v.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.]+%?)?\s*\)$/i))) {
    const L = m[2] ? Number(m[1]) / 100 : Number(m[1])
    return { space: "oklch", L, C: Number(m[3]), H: Number(m[4]) }
  }
  if ((m = v.match(/^hsl\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%\s*(?:\/\s*[\d.]+%?)?\s*\)$/i))) {
    return { space: "rgb", ...hslToRgb(Number(m[1]), Number(m[2]) / 100, Number(m[3]) / 100) }
  }
  if ((m = v.match(/^#([0-9a-f]{6})$/i))) {
    const n = parseInt(m[1], 16)
    return { space: "rgb", r: (n >> 16) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }
  }
  throw new Error(`Unsupported colour: ${value}`)
}

function hslToRgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return { r: f(0), g: f(8), b: f(4) }
}

function oklchToLinear({ L, C, H }) {
  const a = C * Math.cos((H * Math.PI) / 180)
  const b = C * Math.sin((H * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const clamp = (x) => Math.min(1, Math.max(0, x))
  return {
    r: clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  }
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

export function luminance(color) {
  const { r, g, b } =
    color.space === "oklch"
      ? oklchToLinear(color)
      : { r: toLinear(color.r), g: toLinear(color.g), b: toLinear(color.b) }
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

/** Moves the foreground's OKLCH lightness away from the background until the pair reaches `target`. */
export function fixForeground(fgValue, bgValue, target = 4.5) {
  const bg = parseColor(bgValue)
  let fg = parseColor(fgValue)
  if (contrast(fg, bg) >= target) return null
  if (fg.space !== "oklch") fg = rgbToOklch(fg)
  const direction = luminance(bg) > 0.18 ? -1 : 1
  for (let step = 0; step < 100; step++) {
    fg = { ...fg, L: Math.min(1, Math.max(0, fg.L + direction * 0.01)) }
    if (contrast(fg, bg) >= target) return `oklch(${fg.L.toFixed(3)} ${fg.C.toFixed(3)} ${fg.H.toFixed(1)})`
  }
  return direction < 0 ? "oklch(0 0 0)" : "oklch(1 0 0)"
}

function rgbToOklch({ r, g, b }) {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)]
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  let H = (Math.atan2(B, A) * 180) / Math.PI
  if (H < 0) H += 360
  return { space: "oklch", L, C: Math.hypot(A, B), H }
}
