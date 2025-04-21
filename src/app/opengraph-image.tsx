import { ImageResponse } from "next/og";

export const alt = process.env.NEXT_PUBLIC_FRAME_NAME || "Frames V2 Demo";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// dynamically generated OG image for frame preview
export default async function Image() {
  // Use the absolute URL to your public SVG file
  const svgUrl = new URL('/opengraph.svg', process.env.NEXT_PUBLIC_URL).href;
  
  return new ImageResponse(
    (
      <div 
        style={{
          display: 'flex',
          background: 'black',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img src={svgUrl} alt={alt} width={900} />
      </div>
    ),
    {
      ...size,
    }
  );
}
