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
  metadataBase: new URL("https://pin-zulia.vercel.app"),
  title: "PinZulia Bowling Boutique & Gastropub (Desde 1963)",
  description: "Reserva oficial de pistas de bowling y mesas de pool por QR con pase digital instantáneo. C.C. Internacional 5 de Julio, Maracaibo.",
  keywords: [
    "PinZulia",
    "Bowling Maracaibo",
    "Pin Zulia Bowling",
    "5 de Julio",
    "CC Internacional",
    "Pistas de Bowling",
    "Reserva Bowling",
    "Maracaibo Zulia",
  ],
  authors: [{ name: "PinZulia Bowling Boutique 1963" }],
  openGraph: {
    title: "PinZulia Bowling Boutique (Desde 1963)",
    description: "Reserva tu pista de bowling o mesa de pool por QR con confirmación instantánea.",
    url: "https://pin-zulia.vercel.app",
    siteName: "PinZulia Bowling 1963",
    images: [
      {
        url: "/marcas/pinzulia.jpg",
        width: 800,
        height: 800,
        alt: "Logo Oficial PinZulia Bowling 1963",
      },
    ],
    locale: "es_VE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PinZulia Bowling Boutique (Desde 1963)",
    description: "Reserva tu pista de bowling o mesa de pool por QR con confirmación instantánea.",
    images: ["/marcas/pinzulia.jpg"],
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
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Cabinet+Grotesk:wght@800;900&family=JetBrains+Mono:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#040814] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
