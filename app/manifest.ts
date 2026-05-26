import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FLEX Live Sessions",
    short_name: "FLEX",
    description: "Entradas, salas VIP, canciones y accesos para FLEX Live Sessions.",
    start_url: "/app",
    display: "standalone",
    background_color: "#030303",
    theme_color: "#d9a640",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
