import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Sidebar from '@/components/Sidebar'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "numcrypto - crypto dashboard",
  description: "Crypto quantitative analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-US">
      <body className="bg-gray-950 text-white flex flex-col md:flex-row min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">
          {children}
        </main>
      </body>
    </html>
  )
}