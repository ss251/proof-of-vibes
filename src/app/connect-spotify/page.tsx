"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Header } from "~/components/ui/Header";
import { Button } from "~/components/ui/Button";
import { ArrowRight, Check, Music } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getSpotifyAuthUrl } from "~/lib/spotify";
import { useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signInError, setSignInError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for error parameter in URL
    const error = searchParams.get("error");
    if (error) {
      console.error("Spotify connection error:", error);
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
    try {
      // Get the Spotify authorization URL
      const authUrl = getSpotifyAuthUrl();
      
      // Important: Open in a new window instead of redirecting
      // This avoids the X-Frame-Options issue
      const spotifyWindow = window.open(authUrl, '_blank', 'width=600,height=700');
      
      // Inform user about what's happening
      console.log("Opening Spotify auth in new window. Note: You must allow pop-ups for this site.");
      console.log("Make sure you have registered ALL possible redirect URIs in your Spotify Developer Dashboard:");
      console.log("- https://thescoho.ngrok.app/api/auth/callback/spotify");
      console.log("- http://localhost:3000/api/auth/callback/spotify");
      
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.66 0 12 0ZM17.521 17.34C17.281 17.699 16.861 17.819 16.5 17.58C13.68 15.84 10.14 15.479 5.939 16.439C5.521 16.56 5.16 16.26 5.04 15.9C4.92 15.48 5.22 15.12 5.58 15C10.14 13.979 14.1 14.4 17.28 16.319C17.639 16.5 17.76 16.98 17.521 17.34ZM18.961 14.04C18.66 14.46 18.12 14.64 17.7 14.34C14.46 12.36 9.54 11.76 5.76 12.9C5.281 13.08 4.74 12.78 4.56 12.361C4.38 11.88 4.68 11.34 5.1 11.16C9.48 9.9 14.94 10.56 18.66 12.84C19.08 13.08 19.201 13.68 18.961 14.04ZM19.08 10.68C15.24 8.4 8.82 8.16 5.16 9.301C4.56 9.48 3.96 9.12 3.78 8.58C3.6 7.979 3.96 7.38 4.5 7.2C8.76 5.94 15.78 6.24 20.221 8.88C20.76 9.18 20.94 9.9 20.64 10.44C20.34 10.92 19.62 11.1 19.08 10.68Z" fill="white" />
                  </svg>
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