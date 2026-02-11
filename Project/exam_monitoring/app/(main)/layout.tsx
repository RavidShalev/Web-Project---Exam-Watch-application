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

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <a href="#main-content" className="skip-to-main">
        דלג לתוכן הראשי
      </a>
      <Navbar />
      <main id="main-content">
        {children}
      </main>
    </>
  );
}
