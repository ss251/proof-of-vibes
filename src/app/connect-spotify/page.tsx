"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Header } from "~/components/ui/Header";
import { Button } from "~/components/ui/Button";
import { ArrowRight, Check, Music, SparklesIcon } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getSpotifyAuthUrl } from "~/lib/spotify";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

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
  const [spotifyProfile, setSpotifyProfile] = useState<{ name: string; id: string; imageUrl: string | null } | null>(null);
  const searchParams = useSearchParams();
  const [signInError, setSignInError] = useState<string | null>(null);

  console.log("Session:", session);
  
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
      try {
        setIsConnecting(true); // Show loading state while checking
        const response = await fetch('/api/spotify/status');
        const data = await response.json();
        
        setIsConnecting(false);
        if (data.connected) {
          setIsConnected(true);
          // If profile info is available, store it
          if (data.profile) {
            setSpotifyProfile(data.profile);
            console.log("Spotify profile:", data.profile);
          }
        } else if (data.message) {
          console.log("Spotify connection status:", data.message);
        }
      } catch (error) {
        setIsConnecting(false);
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
      // This avoids the X-Frame-Options issue and works better with Warpcast
      const spotifyWindow = window.open(authUrl, '_blank', 'width=600,height=700');
      
      // Inform user about what's happening
      console.log("Opening Spotify auth in a new tab. Please complete authorization there.");
      console.log("After authorizing, you'll return to the app automatically.");
      console.log("Make sure you've registered this redirect URI in your Spotify Dashboard:");
      console.log("- https://proof-of-vibes.vercel.app/api/auth/callback/spotify");
      
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
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#B69BC7] border-r-transparent"></div>
            <p className="mt-6 text-lg font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-8 max-w-md mx-auto text-center shadow-xl border border-gray-800"
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#B69BC7] to-purple-800 rounded-full flex items-center justify-center mb-6">
              <Music className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Connect Your Accounts</h1>
            <p className="mb-6 text-gray-300">Sign in with Farcaster to connect your Spotify account and share your music taste.</p>
            <SignInButton />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-8 max-w-lg mx-auto shadow-xl border border-gray-800"
        >
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#B69BC7] to-purple-800 rounded-full flex items-center justify-center mb-6">
              <Music className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Connect Spotify</h1>
            <p className="text-gray-300 max-w-md mx-auto">
              Link your Spotify account to showcase your music taste and discover music connections with your Farcaster friends
            </p>
          </div>

          <div className="space-y-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex items-center p-6 bg-gray-800/40 rounded-xl border border-gray-700/30 backdrop-blur-sm shadow-md"
            >
              <div className="flex-shrink-0 mr-5">
                <div className="h-14 w-14 rounded-full bg-[#1DB954] flex items-center justify-center overflow-hidden shadow-lg">
                  {spotifyProfile?.imageUrl ? (
                    <Image 
                      width={56} 
                      height={56} 
                      src={spotifyProfile.imageUrl}
                      alt="Spotify Profile"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Image 
                      width={28} 
                      height={28} 
                      src="/spotify-icon.svg" 
                      alt="Spotify"
                    />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg">Spotify Account</h3>
                <p className="text-gray-300 mt-1">
                  {isConnected 
                    ? `Connected as ${spotifyProfile?.name || 'Spotify User'}`
                    : 'Connect to display your top tracks on your profile'}
                </p>
              </div>
              {isConnected ? (
                <div className="bg-green-500/20 rounded-full p-2">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
              ) : (
                <div className="text-gray-400 bg-gray-700/50 rounded-full p-2">
                  <ArrowRight className="h-6 w-6" />
                </div>
              )}
            </motion.div>

            <div className="space-y-4">
              {isConnected && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-green-900/40 to-green-700/20 border border-green-600/30 text-green-300 p-4 rounded-lg text-sm shadow-inner flex items-center"
                >
                  <Check className="h-5 w-5 mr-3 text-green-400 flex-shrink-0" />
                  <p>Successfully connected to Spotify! Your top tracks will now be displayed on your profile.</p>
                </motion.div>
              )}
              
              <Button
                className={`w-full py-3 h-auto text-base ${
                  isConnected 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gradient-to-r from-[#B69BC7] to-[#9778ad] hover:from-[#a78ab6] hover:to-[#8a6da0] shadow-md'
                }`}
                onClick={handleConnectSpotify}
                disabled={isConnecting || isConnected}
              >
                {isConnecting ? (
                  <>
                    <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    Connecting...
                  </>
                ) : isConnected ? (
                  <>Connected to Spotify</>
                ) : (
                  <>Connect Your Spotify Account</>
                )}
              </Button>

              {signInError && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-900/30 border border-red-700/50 text-red-300 p-4 rounded-lg text-sm shadow-inner"
                >
                  {signInError}
                </motion.div>
              )}

              {isConnected && (
                <div className="pt-2">
                  <Link href="/profile">
                    <Button 
                      className="w-full bg-transparent border border-[#B69BC7]/50 hover:bg-[#B69BC7]/20 text-[#B69BC7] py-3 h-auto text-base"
                    >
                      View Your Profile
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="text-center text-gray-400 text-sm pt-4 border-t border-gray-800">
              <p>By connecting, you allow Proof of Vibes to access your Spotify listening data.</p>
              <p className="mt-2">We&apos;ll never post anything without your permission.</p>
            </div>
            
            {!isConnected && (
              <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30">
                <div className="flex items-center mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#B69BC7]/30 flex items-center justify-center mr-2">
                    <span className="text-xs text-[#B69BC7]">✨</span>
                  </div>
                  <h3 className="text-sm font-medium">What you'll get</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5">•</div>
                    <span>Display your top tracks on your profile</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5">•</div>
                    <span>Find friends with similar music taste</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5">•</div>
                    <span>Share your favorite songs to Farcaster</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 