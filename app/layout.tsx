import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://convertx.app"),

  title: {
    default: "ConvertX — Free Online File Converter | PDF, Image, Video, Audio",
    template: "%s | ConvertX Free Converter",
  },

  description:
    "Convert files online for free — no signup, no install. 70+ converters: PDF to Word, JPG to PNG, MP4 to MP3, CSV to JSON, Excel to PDF and more. Fast, secure, browser-based.",

  keywords: [
    // High-volume exact match
    "free online file converter",
    "pdf to word converter",
    "jpg to png converter",
    "png to jpg converter",
    "mp4 to mp3 converter",
    "excel to csv converter",
    "csv to json converter",
    "image converter online",
    "pdf converter online free",
    "video converter online free",
    // Long-tail
    "convert pdf to word online free no signup",
    "convert jpg to png online free",
    "convert mp4 to mp3 online free",
    "convert csv to json online",
    "convert excel to pdf free",
    "online file converter no upload",
    "browser based file converter",
    "secure file converter no server",
    "convert files without uploading",
    "free document converter online",
  ],

  authors: [{ name: "ConvertX", url: "https://convertx.app" }],
  creator: "ConvertX",
  publisher: "ConvertX",
  category: "technology",

  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/scanner.svg",
  },

  openGraph: {
    title: "ConvertX — Free Online File Converter | 70+ Tools",
    description:
      "Convert PDF, images, audio, video, data files online for free. No signup. No install. Runs in your browser. 70+ conversion tools.",
    type: "website",
    url: "https://convertx.app",
    siteName: "ConvertX",
    locale: "en_US",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "ConvertX — Free Online File Converter",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ConvertX — Free Online File Converter",
    description: "70+ free file conversion tools. No signup. No install. Just convert.",
    images: ["/og-image.svg"],
    creator: "@convertx",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://convertx.app",
    languages: { "en-US": "https://convertx.app" },
  },

  verification: {
    // Add your Google Search Console verification token here
    // google: "your-google-verification-token",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Additional SEO meta */}
        <meta name="theme-color" content="#6366f1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={inter.className}>
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
