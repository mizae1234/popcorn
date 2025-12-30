import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/components/Providers"
import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
  title: "Popcorn Creator - สร้างวิดีโอ TikTok ด้วย AI",
  description: "สร้างวิดีโอ TikTok สุดปังสำหรับสินค้าของคุณด้วย AI ง่ายๆ แค่ไม่กี่คลิก เพิ่มยอดขายวันนี้!",
  keywords: ["TikTok", "AI Video", "Video Generator", "TikTok Shop", "สร้างวิดีโอ", "วิดีโอสินค้า"],
  authors: [{ name: "Popcorn Creator" }],
  openGraph: {
    title: "Popcorn Creator - สร้างวิดีโอ TikTok ด้วย AI",
    description: "สร้างวิดีโอ TikTok สุดปังสำหรับสินค้าของคุณด้วย AI",
    type: "website",
    locale: "th_TH",
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
