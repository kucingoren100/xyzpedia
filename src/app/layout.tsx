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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://xyzpedia.my.id"),
  title: {
    default: "XYZPEDIA — Top Up Game & Akun Premium Instan Terpercaya",
    template: "%s | XYZPEDIA",
  },
  description: "Marketplace top-up game injeksi instan 24 jam, voucher game digital, dan akun premium resmi bergaransi 100% di Indonesia dengan QRIS otomatis.",
  keywords: [
    "top up game murah",
    "top up mobile legends",
    "top up free fire",
    "voucher game instan",
    "akun premium netflix murah",
    "spotify premium legal",
    "xyzpedia",
    "qris game store",
  ],
  authors: [{ name: "XYZPEDIA Official" }],
  creator: "XYZPEDIA",
  publisher: "XYZPEDIA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://xyzpedia.my.id",
    siteName: "XYZPEDIA",
    title: "XYZPEDIA — Top Up Game & Akun Premium Instan Terpercaya",
    description: "Platform top up game & akun digital nomor 1 di Indonesia dengan proses otomatis 24 jam dan jaminan garansi 100%.",
  },
  twitter: {
    card: "summary_large_image",
    title: "XYZPEDIA — Top Up Game & Akun Premium Instan",
    description: "Top up game & akun premium resmi bergaransi di Indonesia.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://xyzpedia.my.id/#organization",
      "name": "XYZPEDIA",
      "url": "https://xyzpedia.my.id",
      "logo": "https://xyzpedia.my.id/icon.png",
      "description": "Platform Top Up Game Murah, Akun Premium & Voucher Digital Terpercaya dan Bergaransi di Indonesia.",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Support",
        "availableLanguage": ["Indonesian", "English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://xyzpedia.my.id/#website",
      "url": "https://xyzpedia.my.id",
      "name": "XYZPEDIA - Top Up Game & Akun Premium",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://xyzpedia.my.id/katalog?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdData),
          }}
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
