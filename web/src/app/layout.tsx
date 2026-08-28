import type { Metadata } from "next";
import { Inter, Inter_Tight, IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic", "normal"],
  variable: "--font-serif",
});

const tight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-tight",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://molehills.app"),
  title: "ADHD-friendly app for tasks too big to start | Molehill",
  description:
    "Molehill turns a photo of whatever feels too big into a plan of small steps, then hands you three a day — never a fourth. Built for ADHD minds and anyone stuck.",
  openGraph: {
    title: "Molehill — big things, finished gently",
    description:
      "Photograph the task that feels too big. Molehill turns it into three small steps a day.",
    url: "https://molehills.app",
    siteName: "Molehill",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "Molehill — big things, finished gently" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Molehill — big things, finished gently",
    description:
      "Photograph the task that feels too big. Molehill turns it into three small steps a day.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${serif.variable} ${tight.variable} ${body.variable} ${mono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
