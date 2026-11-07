import type { Metadata, Viewport } from "next";
import { Newsreader, Geist, Space_Grotesk } from "next/font/google";
import "@/styles/globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hygiene Index — Deep Oceanic Restaurant Inspection",
  description:
    "Auditoría comunitaria de bioseguridad, salubridad y transparencia sanitaria para restaurantes.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#09151c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`dark ${newsreader.variable} ${geist.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col justify-between overflow-x-hidden">
        <div className="w-full max-w-md mx-auto min-h-screen flex flex-col relative bg-surface border-x border-outline-variant/20 shadow-2xl overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
