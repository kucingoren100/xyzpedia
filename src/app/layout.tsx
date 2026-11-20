import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileFloatingDock from "@/components/MobileFloatingDock";
import { ThemeProvider } from "@/components/ThemeProvider";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import StoreAnnouncementModal from "@/components/StoreAnnouncementModal";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import RecentOrdersTicker from "@/components/RecentOrdersTicker";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "XYZPEDIA — Top Up Game & Akun Premium Instan",
  description: "Marketplace top-up game injeksi instan, voucher digital, dan akun premium resmi.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${bricolage.variable} ${hanken.variable} min-h-screen antialiased`}
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('xyzpedia-theme');
                if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-[#fbfbfd] text-carbon font-[var(--font-hanken)]"
      >
        <ThemeProvider>
          <Suspense fallback={null}>
            <NavigationProgressBar />
          </Suspense>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileFloatingDock />
          <FloatingWhatsApp />
          <StoreAnnouncementModal />
          <RecentOrdersTicker />
        </ThemeProvider>
      </body>
    </html>
  );
}
