import type { Metadata } from "next";
import { Caveat, IBM_Plex_Mono, Montserrat, Nunito_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL, CONTACT_EMAIL } from "@/lib/site";
import "./globals.css";

const serif = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-serif",
});

const tight = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-tight",
});

const body = Nunito_Sans({
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
  metadataBase: new URL(SITE_URL),
  title: "ADHD-friendly app for tasks too big to start | Unbig",
  description:
    "Show Unbig the task that feels too big — a photo, or one sentence. It writes a plan of small steps and hands you three a day, never a fourth. Built for ADHD minds and anyone stuck.",
  openGraph: {
    title: "Unbig — make big things small enough to start",
    description:
      "A photo, or one sentence, about the task that feels too big. Unbig turns it into three small steps a day.",
    url: SITE_URL,
    siteName: "Unbig",
    images: [
      {
        url: "/og-unbig.png",
        width: 1200,
        height: 630,
        alt: "Unbig — make big things small enough to start",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unbig — make big things small enough to start",
    description:
      "A photo, or one sentence, about the task that feels too big. Unbig turns it into three small steps a day.",
    images: ["/og-unbig.png"],
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
      className={`${serif.variable} ${tight.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "SoftwareApplication",
                  name: "Unbig",
                  applicationCategory: "ProductivityApplication",
                  operatingSystem: "iOS, Android",
                  url: SITE_URL,
                  description:
                    "An ADHD-friendly app that turns a photo — or one sentence — about a task too big to start into a plan of small steps, handing you three a day and never a fourth. No streaks, timers, or guilt.",
                },
                {
                  "@type": "Organization",
                  name: "Unbig",
                  url: SITE_URL,
                  email: CONTACT_EMAIL,
                },
              ],
            }),
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
