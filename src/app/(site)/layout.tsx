import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { MotionProvider } from "@/components/motion-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { pageFontVariables } from "@/lib/page-fonts"
import "../globals.css"
import "../page-themes.css"

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})


export const metadata: Metadata = {
  title: {
    default: "Porch — your link-in-bio page",
    template: "%s · Porch",
  },
  description:
    "Build a beautiful link-in-bio page in minutes. Your photo, your links, your theme — shared at one short URL.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} ${pageFontVariables} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MotionProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </MotionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
