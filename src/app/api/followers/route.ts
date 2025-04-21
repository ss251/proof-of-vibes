import { NextResponse } from "next/server";

// Neynar API base URL
const NEYNAR_API_BASE = 'https://api.neynar.com/v2/farcaster';
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "";

// Fetch followers for a user
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const fid = url.searchParams.get("fid");
    const limit = url.searchParams.get("limit") || "20";
    const cursor = url.searchParams.get("cursor");
    
    if (!fid) {
      return NextResponse.json(
        { error: "Missing fid parameter" },
        { status: 400 }
      );
    }

    const fidNumber = Number(fid);
    if (isNaN(fidNumber)) {
      return NextResponse.json(
        { error: "Invalid fid format" },
        { status: 400 }
      );
    }

    // Build the API URL with query parameters
    let apiUrl = `${NEYNAR_API_BASE}/followers?fid=${fidNumber}&limit=${limit}`;
    
    // Add cursor for pagination if provided
    if (cursor) {
      apiUrl += `&cursor=${encodeURIComponent(cursor)}`;
    }
    
    console.log("Fetching followers from Neynar URL:", apiUrl);
    
    // Fetch followers data from Neynar API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Neynar API error: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: `Failed to fetch followers: ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching followers from Neynar:", error);
    return NextResponse.json(
      { error: "Failed to fetch followers data" },
      { status: 500 }
    );
  }
} 