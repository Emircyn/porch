import { Geist } from "next/font/google"

import { pageFontVariables } from "@/lib/page-fonts"
import "../globals.css"
import "../page-themes.css"

const geist = Geist({ variable: "--font-sans", subsets: ["latin", "latin-ext"] })

// Public pages get their own root layout: no theme switcher, toasts or animation libraries. What a visitor
// downloads is the page itself and Next's runtime, which matters in Instagram's and TikTok's in-app browsers.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${pageFontVariables} antialiased`}>
      <body className="min-h-svh">{children}</body>
    </html>
  )
}
