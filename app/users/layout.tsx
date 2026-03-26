// src/app/layout.tsx
import type { Metadata } from "next";
import { Space_Grotesk, Playfair_Display, Inter } from "next/font/google";


// 1. Geometric Sans for massive headings ("Helious", "Organized.")
const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    display: "swap",
});

// 2. Elegant Serif for the italic subtext ("So you don't have to be.")
const playfair = Playfair_Display({
    subsets: ["latin"],
    style: ["italic", "normal"],
    variable: "--font-playfair",
    display: "swap",
});

// 3. Clean Sans for body text and small UI elements
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Welcome page | Users",
    description: "View all details about the church",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${spaceGrotesk.variable} ${playfair.variable} ${inter.variable} font-sans bg-black text-white antialiased`}>
                {children}
            </body>
        </html>
    );
}