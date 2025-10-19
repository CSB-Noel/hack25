import type React from "react"
import type { Metadata } from "next"
import { Inconsolata } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers/session-provider"
import "./globals.css"

const inconsolata = Inconsolata({ subsets: ["latin"], weight: ["200","300","400","500","600","700","800","900"] })

export const metadata: Metadata = {
  title: "Pyxis",
  description: "Navigate your finances like the cosmos",
  generator: "v0.app",
  icons: {
    icon: "/star.svg",
    shortcut: "/star.svg",
    apple: "/star.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
  <body className={`${inconsolata.className} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
