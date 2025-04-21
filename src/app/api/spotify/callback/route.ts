import { NextResponse } from "next/server";
import { getSpotifyToken } from "~/lib/spotify";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const state = url.searchParams.get("state");

  // If the user denied access or an error occurred
  if (error || !code) {
    return NextResponse.redirect(new URL("/connect-spotify?error=access_denied", request.url));
  }

  try {
    // Exchange code for token
    const tokenResponse = await getSpotifyToken(code);

    // Create response object first
    const response = NextResponse.redirect(new URL("/profile", request.url));
    
    // Set access token with expiry
    response.cookies.set("spotify_access_token", tokenResponse.access_token, {
      maxAge: tokenResponse.expires_in,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    
    // Set refresh token (long-lived)
    response.cookies.set("spotify_refresh_token", tokenResponse.refresh_token, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Return the response with cookies set
    return response;
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return NextResponse.redirect(new URL("/connect-spotify?error=token_error", request.url));
  }
} 