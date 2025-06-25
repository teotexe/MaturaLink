import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MaturaLink - Organizza i tuoi collegamenti per la Maturità",
  description:
    "App per organizzare collegamenti, risorse e appunti utili per preparare l'esame di Maturità italiana.",
  openGraph: {
    title: "MaturaLink - Organizza i tuoi collegamenti per la Maturità",
    description:
      "App per organizzare collegamenti, risorse e appunti utili per preparare l'esame di Maturità italiana.",
    url: "https://maturalink.vercel.app",
    siteName: "MaturaLink",
    locale: "it_IT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
