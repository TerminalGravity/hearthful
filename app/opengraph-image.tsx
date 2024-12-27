/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';

export const runtime = "edge";
export const alt = "Hearthful - Family Gathering Platform";
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          fontSize: 60,
          color: 'black',
          background: '#f6f6f6',
          width: '100%',
          height: '100%',
          paddingTop: 50,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          src="https://hearthful.vercel.app/logo.png"
          alt="Hearthful Logo"
          width={200}
          height={200}
        />
        <div
          style={{
            marginTop: 40,
          }}
        >
          Hearthful
        </div>
        <div
          style={{
            fontSize: 30,
            marginTop: 20,
            color: '#666',
          }}
        >
          Family Gathering Platform
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
