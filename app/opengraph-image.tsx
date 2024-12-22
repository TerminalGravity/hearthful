/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/server';

export const runtime = "edge";
export const alt = "Hearthful - Family Gathering Platform";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          backgroundImage:
            "linear-gradient(to bottom right, #E0E7FF 25%, #ffffff 50%, #CFFAFE 75%)",
        }}
      >
        <img
          src={new URL("../public/logo.png", import.meta.url).toString()}
          alt="Hearthful Logo"
          height={120}
        />
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: "60px",
              fontWeight: "bold",
              background: "linear-gradient(to bottom right, #000000 21.66%, #78716c 86.47%)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: "5rem",
              letterSpacing: "-0.02em",
            }}
          >
            Hearthful
          </h1>
          <h3
            style={{
              fontSize: "22px",
              marginTop: "12px",
              color: "#374151",
            }}
          >
            Bringing families together, one gathering at a time
          </h3>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
