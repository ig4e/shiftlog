import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shift Wellbeing",
    short_name: "Shift Wellbeing",
    description: "A simple tool for logging and managing work shifts.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Start Shift",
        short_name: "Start",
        description: "Log the start of your shift",
        url: "/?action=start",
        icons: [{ src: "/start.png", sizes: "96x96" }],
      },
      {
        name: "End Shift",
        short_name: "End",
        description: "Log the end of your shift",
        url: "/?action=end",
        icons: [{ src: "/end.png", sizes: "96x96" }],
      },
    ],
  };
}
