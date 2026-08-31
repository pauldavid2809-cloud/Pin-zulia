import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PinZulia Bowling Boutique & Gastropub",
    short_name: "PinZulia",
    description: "14 Pistas Computarizadas, Gastropub Artesanal y Glow Bowling en Maracaibo",
    start_url: "/",
    display: "standalone",
    background_color: "#070f1e",
    theme_color: "#0284c7",
    icons: [
      {
        src: "/marcas/pinzulia.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/marcas/pinzulia.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
