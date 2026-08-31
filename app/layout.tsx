import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/config";

export const viewport: Viewport = {
  themeColor: "#040814",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} — WebApp Oficial (14 Pistas · Gastropub · Glow UV)`,
  description: `${SITE_CONFIG.tagline}. Reserva de pistas en tiempo real con pase digital QR, comanda directa al carril y menú con tasa oficial BCV.`,
  keywords: [
    "PinZulia",
    "Bowling Maracaibo",
    "Pin Zulia Bowling",
    "5 de Julio",
    "CC Internacional",
    "Pistas de Bowling",
    "Pinsas Romanas",
    "Glow Bowling",
    "Smash Burgers",
    "Maracaibo Zulia",
  ],
  authors: [{ name: "PinZulia Bowling Boutique" }],
  openGraph: {
    title: `${SITE_CONFIG.name} | WebApp Oficial`,
    description: `${SITE_CONFIG.tagline}. Reserva tu pista y pide comida al carril.`,
    url: "https://pinzulia.vercel.app",
    siteName: "PinZulia Bowling",
    images: [
      {
        url: "/marcas/pinzulia-cover.jpg",
        width: 1200,
        height: 630,
        alt: "PinZulia Bowling Boutique & Gastropub",
      },
    ],
    locale: "es_VE",
    type: "website",
  },
  icons: {
    icon: "/marcas/pinzulia.jpg",
    apple: "/marcas/pinzulia.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#040814] text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}