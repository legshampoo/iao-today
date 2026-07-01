import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthHashHandler } from '@/components/AuthHashHandler'
import { Footer } from '@/components/Footer'
import icon from './icon.png'
import './globals.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: 'Siargao Now',
  description: "What's happening in Siargao, Philippines",
  openGraph: {
    title: 'Siargao Now',
    description: "What's happening in Siargao, Philippines",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: icon.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <AuthHashHandler />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
