import { NextResponse } from "next/server";

// Neynar API base URL
const NEYNAR_API_BASE = 'https://api.neynar.com/v2/farcaster';
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "";

// Handle GET requests for fetching user data
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const fid = url.searchParams.get("fid");
    
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

    // Use the user/bulk endpoint with single fid for consistency with API
    const apiUrl = `${NEYNAR_API_BASE}/user/bulk?fids=${fidNumber}`;
    
    console.log("Fetching from Neynar URL:", apiUrl);
    
    // Fetch user data from Neynar API
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
        { error: `Failed to fetch user: ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user from Neynar:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

// Handle POST requests for fetching multiple users
export async function POST(request: Request) {
  try {
    const { fids } = await request.json();
    
    if (!fids || !Array.isArray(fids) || fids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing fids parameter" },
        { status: 400 }
      );
    }

    // Convert all FIDs to numbers and filter out any invalid values
    const validFids = fids
      .map(fid => Number(fid))
      .filter(fid => !isNaN(fid));

    if (validFids.length === 0) {
      return NextResponse.json(
        { error: "No valid FIDs provided" },
        { status: 400 }
      );
    }

    // Use the user/bulk endpoint
    const apiUrl = `${NEYNAR_API_BASE}/user/bulk?fids=${validFids.join(',')}`;
    
    console.log("Fetching from Neynar URL:", apiUrl);
    
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
        { error: `Failed to fetch users: ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching users from Neynar:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
} 