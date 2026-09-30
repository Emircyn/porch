import {
  DM_Sans,
  Geist,
  Inter,
  Libre_Baskerville,
  Merriweather,
  Montserrat,
  Outfit,
  Plus_Jakarta_Sans,
  Poppins,
} from "next/font/google"

// Fonts for public-page themes (src/app/page-themes.css). preload: false means a browser only downloads
// the one font the page's theme actually uses.
const geist = Geist({ variable: "--font-page-geist", subsets: ["latin", "latin-ext"], preload: false })
const inter = Inter({ variable: "--font-page-inter", subsets: ["latin", "latin-ext"], preload: false })
const poppins = Poppins({
  variable: "--font-page-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  preload: false,
})
const dmSans = DM_Sans({ variable: "--font-page-dm-sans", subsets: ["latin", "latin-ext"], preload: false })
const outfit = Outfit({ variable: "--font-page-outfit", subsets: ["latin", "latin-ext"], preload: false })
const merriweather = Merriweather({
  variable: "--font-page-merriweather",
  subsets: ["latin", "latin-ext"],
  preload: false,
})
const montserrat = Montserrat({ variable: "--font-page-montserrat", subsets: ["latin", "latin-ext"], preload: false })
const libreBaskerville = Libre_Baskerville({
  variable: "--font-page-libre-baskerville",
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
  preload: false,
})
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-page-plus-jakarta",
  subsets: ["latin", "latin-ext"],
  preload: false,
})

export const pageFontVariables = [
  geist,
  inter,
  poppins,
  dmSans,
  outfit,
  merriweather,
  montserrat,
  libreBaskerville,
  plusJakarta,
]
  .map((font) => font.variable)
  .join(" ")
