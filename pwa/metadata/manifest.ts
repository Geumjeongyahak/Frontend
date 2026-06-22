import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "금정열린배움터",
    short_name: "금정열린배움터",
    description: "금정열린배움터 업무지원 플랫폼",
    start_url: "/",
    display: "standalone",
    background_color: "#F3F3F3",
    theme_color: "#88CD5A",
    lang: "ko-KR",
    orientation: "portrait",
    icons: [
      {
        src: "/logo.svg",
        sizes: "84x84",
        type: "image/svg+xml",
      },
      {
        src: "/logo.svg",
        sizes: "84x84",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
