/* eslint-disable @next/next/no-img-element */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

const logoSvg = readFileSync(join(process.cwd(), "public", "logo.svg"), "utf8");
const logoDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`;

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
          borderRadius: 120,
        }}
      >
        <img
          src={logoDataUri}
          alt="금정열린배움터 로고"
          style={{
            width: "84%",
            height: "84%",
          }}
        />
      </div>
    ),
    size,
  );
}
