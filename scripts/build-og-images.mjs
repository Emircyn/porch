// Renders the link-preview (Open Graph) images into public/og, 1200 × 630 JPEGs:
//   public/og/themes/<id>.jpg  for /themes/<id>
//   public/og/pages/<id>.jpg   for every user page in that theme
// Pre-rendering keeps image work off the Worker (10 ms CPU on the free plan). Rerun after changing themes.
// Usage: start `npm run dev`, then `node scripts/build-og-images.mjs [dev URL] [public host]`,
// e.g. node scripts/build-og-images.mjs http://127.0.0.1:3000 porch.example.com
// (needs a Chromium for Playwright: `npx playwright install chromium`).
import fs from "node:fs"
import path from "node:path"

import { chromium } from "playwright"
import sharp from "sharp"

const base = process.argv[2] ?? "http://127.0.0.1:3000"
// The address printed on theme cards; the dev server itself only knows localhost.
const host = process.argv[3] ?? "porch.emircan-erdemci.workers.dev"
const ids = [...fs.readFileSync("src/lib/themes.ts", "utf8").matchAll(/id: "([\w-]+)"/g)].map((m) => m[1])

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
for (const kind of ["themes", "pages"]) {
  fs.mkdirSync(path.join("public/og", kind), { recursive: true })
  for (const id of ids) {
    await page.goto(`${base}/og-card/${kind}/${id}?host=${encodeURIComponent(host)}`, { waitUntil: "networkidle" })
    // Hide the Next.js dev indicator so it does not end up in the image.
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" })
    await page.evaluate(() => document.fonts.ready)
    const png = await page.locator("#og-card").screenshot()
    const out = path.join("public/og", kind, `${id}.jpg`)
    await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(out)
    console.log(`${out} ${(fs.statSync(out).size / 1024).toFixed(0)} KB`)
  }
}
await browser.close()
