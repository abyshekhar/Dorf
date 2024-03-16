


import "./globals.css";



import { Viewport } from "next";
import { Inter as FontSans } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";



import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";





const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" })

const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
})
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}
export const metadata = {
  metadataBase: new URL('https://dorf.com'),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["Dorf forms", "Form builder"],
  authors: [
    {
      name: "matheins",
      url: "https://github.com/matheins",
    },
  ],
  creator: "matheins",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.jpg`],
    creator: "@matheins",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Analytics />
          <Toaster />
          <TailwindIndicator />
        </ThemeProvider>
      </body>
      {process.env.NODE_ENV === "production" && (
        <Script
          src={`${env.NEXT_PUBLIC_UMAMI_DOMAIN}/script.js`}
          data-website-id={env.NEXT_PUBLIC_UMAMI_SITE_ID}
        />
      )}
    </html>
  )
}