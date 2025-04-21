import { NextRequest, NextResponse } from "next/server";
import { getUserTopTracks, convertTimeFrameToRange, SpotifyTrack } from "~/lib/spotify";

export async function GET(request: NextRequest) {
  // Get the access token from cookies
  const accessToken = request.cookies.get("spotify_access_token")?.value;
  
  if (!accessToken) {
    return NextResponse.json({ 
      error: "No Spotify access token found",
      connected: false
    }, { status: 401 });
  }
  
  // Get the timeframe from query params (week, month, year)
  const url = new URL(request.url);
  const timeFrame = url.searchParams.get("timeFrame") || "week";
  const limit = parseInt(url.searchParams.get("limit") || "5", 10);
  
  try {
    // Convert UI timeframe to Spotify API timeframe
    const apiTimeRange = convertTimeFrameToRange(timeFrame as "week" | "month" | "year");
    
    // Fetch top tracks from Spotify API
    const topTracks = await getUserTopTracks(accessToken, apiTimeRange, limit);
    
    // Transform the response to a simpler format
    const tracks = topTracks.items.map((track: SpotifyTrack) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((artist: { id: string; name: string }) => artist.name).join(", "),
      album: track.album.name,
      albumArt: track.album.images[0]?.url || "",
      timeFrame
    }));
    
    return NextResponse.json({ 
      tracks,
      connected: true
    });
  } catch (error) {
    console.error("Error fetching Spotify top tracks:", error);
    
    return NextResponse.json({ 
      error: "Failed to fetch top tracks from Spotify",
      connected: false
    }, { status: 500 });
  }
} 