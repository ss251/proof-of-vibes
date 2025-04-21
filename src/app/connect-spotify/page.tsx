"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Header } from "~/components/ui/Header";
import { Button } from "~/components/ui/Button";
import { ArrowRight, Check, Music } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getSpotifyAuthUrl } from "~/lib/spotify";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

// Dynamically import signin component to avoid SSR issues
const SignInButton = dynamic(() => import("~/components/SignInWithFarcaster"), {
  ssr: false,
  loading: () => (
    <div className="bg-[#B69BC7] hover:bg-[#a78ab6] py-2 px-4 rounded-md text-white font-medium">
      Loading Sign In...
    </div>
  ),
});

export default function ConnectSpotify() {
  const { data: session, status } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const searchParams = useSearchParams();
  const [signInError, setSignInError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for error parameter in URL
    const error = searchParams.get("error");
    if (error) {
      console.error("Spotify connection error:", error);
      if (error === "token_error") {
        setSignInError("Failed to exchange authorization code for access token. Please try again.");
      } else if (error === "access_denied") {
        setSignInError("Spotify access was denied. Please allow access to connect your account.");
      } else {
        setSignInError(`Error connecting to Spotify: ${error}`);
      }
    }
    
    // Check if user already has Spotify connected
    const checkSpotifyConnection = async () => {
      // We can't directly access httpOnly cookies, so we'll make a small request to check
      try {
        const response = await fetch('/api/spotify/status');
        const data = await response.json();
        if (data.connected) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Error checking Spotify connection:", error);
      }
    };
    
    if (status === "authenticated") {
      checkSpotifyConnection();
    }
  }, [searchParams, status]);

  const handleConnectSpotify = async () => {
    setIsConnecting(true);
    setSignInError(null);
    try {
      // Get the Spotify authorization URL
      const authUrl = getSpotifyAuthUrl();
      
      // Check if we're in Warpcast
      const isWarpcast = typeof window !== 'undefined' && 
                        (window.location.hostname === 'warpcast.com' || 
                         window.location.hostname.includes('frame.warpcast.com') ||
                         window.location.href.includes('warpcast.com'));
      
      console.log("Is Warpcast environment:", isWarpcast);
      
      // Important: Open in a new window instead of redirecting
      // This avoids the X-Frame-Options issue
      const spotifyWindow = window.open(authUrl, '_blank', 'width=600,height=700');
      
      // Inform user about what's happening
      console.log("Opening Spotify auth in new window. Note: You must allow pop-ups for this site.");
      console.log("Make sure you have registered the production redirect URI in your Spotify Developer Dashboard:");
      console.log("- https://proof-of-vibes.vercel.app/api/auth/callback/spotify (Production)");
      if (window.location.hostname === 'localhost') {
        console.log("- http://localhost:3000/api/auth/callback/spotify (Only needed for local development)");
      }
      
      // Don't set isConnected here - it will be set when the user returns
      // via the callback and the status endpoint checks their cookies
      
      // Check if popup was blocked
      if (!spotifyWindow || spotifyWindow.closed || typeof spotifyWindow.closed === 'undefined') {
        setSignInError("Pop-up was blocked. Please allow pop-ups for this site and try again.");
        setIsConnecting(false);
      }
    } catch (error) {
      console.error("Error connecting to Spotify:", error);
      setIsConnecting(false);
      setSignInError("Failed to connect to Spotify. Please check console for details.");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#B69BC7] border-r-transparent"></div>
            <p className="mt-4">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="bg-gray-900 rounded-lg p-8 max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Connect Your Accounts</h1>
            <p className="mb-6">Please sign in with Farcaster first to connect your Spotify account.</p>
            <SignInButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="bg-gray-900 rounded-lg p-8 max-w-md mx-auto">
          <div className="text-center mb-8">
            <Music className="mx-auto h-12 w-12 text-[#B69BC7] mb-4" />
            <h1 className="text-2xl font-bold mb-2">Connect Spotify</h1>
            <p className="text-gray-400">
              Link your Spotify account to share your music taste with your Farcaster friends
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center p-4 border border-gray-800 rounded-lg">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 rounded-full bg-[#1DB954] flex items-center justify-center">
                  <Image 
                    width={24} 
                    height={24} 
                    src="/spotify-icon.svg" 
                    alt="Spotify"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Spotify Account</h3>
                <p className="text-gray-400 text-sm">
                  {isConnected 
                    ? `Connected as User #${session?.user?.fid || 'Unknown'}` 
                    : 'Connect to show your top tracks'}
                </p>
              </div>
              {isConnected ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <ArrowRight className="h-5 w-5 text-gray-400" />
              )}
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-[#B69BC7] hover:bg-[#a78ab6]"
                onClick={handleConnectSpotify}
                disabled={isConnecting || isConnected}
              >
                {isConnecting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    Connecting...
                  </>
                ) : isConnected ? (
                  <>Connected</>
                ) : (
                  <>Connect Spotify</>
                )}
              </Button>

              {signInError && (
                <div className="text-red-500 p-2 text-sm border border-red-300 rounded-md bg-red-50">
                  {signInError}
                </div>
              )}

              {isConnected && (
                <Link href="/">
                  <Button className="w-full" variant="outline">
                    Return to Home
                  </Button>
                </Link>
              )}
            </div>

            <div className="text-center text-gray-400 text-xs">
              <p>By connecting, you allow Proof of Vibes to access your Spotify listening data.</p>
              <p className="mt-1">We&apos;ll never post anything without your permission.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 