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
        src: "/pwa-logo.png",
        sizes: "972x972",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}