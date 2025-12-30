import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/components/Providers"
import Navbar from "@/components/Navbar"

// Base URL for metadata
const baseUrl = process.env.NEXTAUTH_URL
  ? new URL(process.env.NEXTAUTH_URL)
  : new URL('https://popcorn-creator.com')

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title: {
    default: "Popcorn Creator - สร้างวิดีโอ TikTok ด้วย AI",
    template: "%s | Popcorn Creator",
  },
  description: "สร้างวิดีโอ TikTok สุดปังสำหรับสินค้าของคุณด้วย AI ง่ายๆ แค่ไม่กี่คลิก เพิ่มยอดขายวันนี้! รองรับภาษาไทย",
  keywords: ["TikTok", "AI Video", "Video Generator", "TikTok Shop", "สร้างวิดีโอ", "วิดีโอสินค้า", "AI Marketing", "Content Creator"],
  authors: [{ name: "Popcorn Creator" }],
  creator: "Popcorn Creator",
  publisher: "Popcorn Creator",
  openGraph: {
    title: "Popcorn Creator - สร้างวิดีโอ TikTok ด้วย AI",
    description: "สร้างวิดีโอ TikTok สุดปังสำหรับสินค้าของคุณด้วย AI ง่ายๆ แค่ไม่กี่คลิก",
    url: baseUrl,
    siteName: "Popcorn Creator",
    images: [
      {
        url: "/logo.jpg", // Using local logo
        width: 800,
        height: 600,
        alt: "Popcorn Creator",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Popcorn Creator - สร้างวิดีโอ TikTok ด้วย AI",
    description: "สร้างวิดีโอ TikTok สุดปังสำหรับสินค้าของคุณด้วย AI",
    images: ["/logo.jpg"],
    creator: "@popcorncreator",
  },
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          defer
        />
      </body>
    </html>
  )
}
