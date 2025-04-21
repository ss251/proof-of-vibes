import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Check if Spotify access token cookie exists
  const hasAccessToken = request.cookies.has("spotify_access_token");
  
  // Return connection status
  return NextResponse.json({ 
    connected: hasAccessToken
  });
} 