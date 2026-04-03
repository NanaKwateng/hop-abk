import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"


import { ThemeProvider } from "@/components/theme-provider"
import { PWAProvider } from "@/components/pwa/pwa-provider";
//import { ErrorBoundary } from "@/components/pwa/error-boundary";

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HOP | Abuakwa Central Assembly",
    template: "%s — HOP Church",
  },
  description: "Spaces for workflow management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HOP Zones",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "HOP | Abuakwa Central Assembly",
    title: "House of Power Min. Int'l.",
    description: "Spaces for Workflow Management",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={figtree.variable} suppressHydrationWarning>

      <head>
        {/* ── Favicon (browser tabs) ── */}
        <link rel="icon" href="/icons/icon-72x72.png" type="image/png" sizes="72x72" />
        <link rel="icon" href="/icons/icon-96x96.png" type="image/png" sizes="96x96" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />

        {/* ── iOS ── */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HOP ABK" />
        <link rel="manifest" href="/manifest.json" />
        {/* ── Android / General ── */}
        <meta name="mobile-web-app-capable" content="yes" />

        {/* ── Windows Tiles ── */}
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#1a365d" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PWAProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>

          <Toaster />
        </PWAProvider>
        {/* <ErrorBoundary>
        </ErrorBoundary> */}
      </body>
    </html>
  );
}
