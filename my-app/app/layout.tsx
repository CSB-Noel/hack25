import type React from "react"
import type { Metadata } from "next"
import { Mulish } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const mulish = Mulish({ subsets: ["latin"], weight: ["200", "300", "400", "600", "700", "800", "900"] })

export const metadata: Metadata = {
  title: "StellarMail",
  description: "Navigate your inbox like the cosmos",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${mulish.className} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
