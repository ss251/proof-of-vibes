import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "~/lib/spotify";

export async function GET(request: NextRequest) {
  // Check if Spotify access token cookie exists
  const accessToken = request.cookies.get("spotify_access_token")?.value;
  
  if (!accessToken) {
    return NextResponse.json({ 
      connected: false,
      message: "No Spotify access token found"
    });
  }
  
  try {
    // Try to make a lightweight API call to verify the token is valid
    const userProfile = await getUserProfile(accessToken);
    
    // If we get here, the token is valid and we have a connection
    return NextResponse.json({ 
      connected: true,
      profile: {
        name: userProfile.display_name,
        id: userProfile.id,
        imageUrl: userProfile.images?.[0]?.url || null
      }
    });
  } catch (error) {
    console.error("Error verifying Spotify token:", error);
    
    // Token might be expired or invalid
    return NextResponse.json({ 
      connected: false,
      message: "Invalid or expired Spotify token"
    });
  }
} 