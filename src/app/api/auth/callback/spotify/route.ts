import { NextResponse } from "next/server";
import { getSpotifyToken } from "~/lib/spotify";

// Mini-app URL in Warpcast
const WARPCAST_MINIAPP_URL = "https://warpcast.com/~/developers/mini-apps/preview?url=https://proof-of-vibes.vercel.app";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const state = url.searchParams.get("state");
  const referer = request.headers.get("referer") || "";
  const isFromWarpcast = referer.includes("warpcast.com");

  // If the user denied access or an error occurred
  if (error || !code) {
    const errorRedirectUrl = isFromWarpcast
      ? WARPCAST_MINIAPP_URL
      : "/connect-spotify?error=access_denied";
    
    return NextResponse.redirect(new URL(errorRedirectUrl, request.url));
  }

  try {
    // Exchange code for token using the state parameter to ensure correct redirect URI
    const tokenResponse = await getSpotifyToken(code, state || undefined);
    
    // Determine where to redirect after successful authentication
    let successRedirectUrl = "/profile";
    
    // If came from Warpcast, redirect back to the mini-app
    if (isFromWarpcast) {
      successRedirectUrl = WARPCAST_MINIAPP_URL;
      console.log("Redirecting back to Warpcast mini-app");
    }

    // Create response object with the appropriate redirect
    const response = NextResponse.redirect(new URL(successRedirectUrl, request.url));
    
    // Set access token with expiry
    response.cookies.set("spotify_access_token", tokenResponse.access_token, {
      maxAge: tokenResponse.expires_in,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    
    // Set refresh token (long-lived)
    response.cookies.set("spotify_refresh_token", tokenResponse.refresh_token, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    // Return the response with cookies set
    return response;
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    
    // Handle errors differently based on where the request came from
    const errorRedirectUrl = isFromWarpcast
      ? `${WARPCAST_MINIAPP_URL}?error=token_error`
      : "/connect-spotify?error=token_error";
      
    return NextResponse.redirect(new URL(errorRedirectUrl, request.url));
  }
} 