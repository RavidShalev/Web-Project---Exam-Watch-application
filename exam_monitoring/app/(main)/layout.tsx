import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Heebo } from 'next/font/google'
import "../globals.css";
import Navbar from "../components/Navbar";

const heebo = Heebo({ subsets: ['hebrew'] })

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exam Monitoring System",
  description: "System for monitoring exams effectively and efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${heebo.className} bg-gray-50 dark:bg-gray-900 transition-colors duration-300`} >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
