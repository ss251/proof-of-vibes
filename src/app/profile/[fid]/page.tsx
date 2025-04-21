"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Header } from "~/components/ui/Header";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/Button";
import { ExternalLink, Music, User2 } from "lucide-react";

// Keep mock data for tracks since we don't have real Spotify data
// You can remove some of the mock user data that will be replaced with real data
const mockTracks = {
  "week": [
    { name: "Summertime", artist: "DJ Jazzy Jeff & The Fresh Prince", album: "Homebase", albumArt: "https://i.imgur.com/lGIxJKC.jpg" },
    { name: "93 'til Infinity", artist: "Souls of Mischief", album: "93 'til Infinity", albumArt: "https://i.imgur.com/C3vqSNZ.jpg" },
    { name: "Flava In Ya Ear", artist: "Craig Mack", album: "Project: Funk da World", albumArt: "https://i.imgur.com/kqLjtL3.jpg" },
    { name: "Electric Relaxation", artist: "A Tribe Called Quest", album: "Midnight Marauders", albumArt: "https://i.imgur.com/K5YvOfS.jpg" },
    { name: "The Next Episode", artist: "Dr. Dre ft. Snoop Dogg", album: "2001", albumArt: "https://i.imgur.com/0pRKrCD.jpg" }
  ],
  "month": [
    { name: "It Was A Good Day", artist: "Ice Cube", album: "The Predator", albumArt: "https://i.imgur.com/Hynozn7.jpg" },
    { name: "Mass Appeal", artist: "Gang Starr", album: "Hard to Earn", albumArt: "https://i.imgur.com/OfQTd6Z.jpg" },
    { name: "C.R.E.A.M.", artist: "Wu-Tang Clan", album: "Enter the Wu-Tang (36 Chambers)", albumArt: "https://i.imgur.com/pqkKcbb.jpg" },
    { name: "They Reminisce Over You", artist: "Pete Rock & CL Smooth", album: "Mecca and the Soul Brother", albumArt: "https://i.imgur.com/B5Zqbj8.jpg" },
    { name: "Summertime", artist: "DJ Jazzy Jeff & The Fresh Prince", album: "Homebase", albumArt: "https://i.imgur.com/lGIxJKC.jpg" }
  ],
  "year": [
    { name: "Nuthin' But a 'G' Thang", artist: "Dr. Dre ft. Snoop Dogg", album: "The Chronic", albumArt: "https://i.imgur.com/9SyGpSa.jpg" },
    { name: "Award Tour", artist: "A Tribe Called Quest", album: "Midnight Marauders", albumArt: "https://i.imgur.com/K5YvOfS.jpg" },
    { name: "Passin' Me By", artist: "The Pharcyde", album: "Bizarre Ride II the Pharcyde", albumArt: "https://i.imgur.com/2J1gGDh.jpg" },
    { name: "I Got 5 On It", artist: "Luniz", album: "Operation Stackola", albumArt: "https://i.imgur.com/Vqogtm9.jpg" },
    { name: "Summertime", artist: "DJ Jazzy Jeff & The Fresh Prince", album: "Homebase", albumArt: "https://i.imgur.com/lGIxJKC.jpg" }
  ]
};

type TimeFrame = "week" | "month" | "year";

interface UserProfile {
  fid: number;
  username: string;
  displayName: string;
  pfp?: {
    url: string;
  };
  profile?: {
    bio?: {
      text: string;
    };
  };
  followerCount: number;
  followingCount: number;
  following?: boolean;
}

interface Track {
  name: string;
  artist: string;
  album: string;
  albumArt: string;
}

export default function UserProfile() {
  const params = useParams();
  const { data: session } = useSession();
  const fid = typeof params.fid === "string" ? params.fid : "";
  const numericFid = parseInt(fid, 10);
  
  // Check if this is the current user's own profile
  const isOwnProfile = session?.user?.fid === numericFid;
  
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("week");
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        
        if (isNaN(numericFid)) {
          setError("Invalid FID format");
          setLoading(false);
          return;
        }
        
        // Directly use fetch to call our API route, avoiding client-neynar imports
        const response = await fetch(`/api/users?fid=${numericFid}`);

        console.log("Response:", response);
        
        // Handle API errors
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error: ${response.status} ${errorText}`);
          setError(`Failed to fetch user: ${response.statusText}`);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        // Handle the bulk API response format which has users array instead of a single user
        if (!data || !data.users || data.users.length === 0) {
          setError(`User with FID ${fid} not found`);
          setLoading(false);
          return;
        }
        
        // Get the first user from the array
        const userData = data.users[0];
        
        // Map the API response to our UserProfile type
        const profile: UserProfile = {
          fid: userData.fid,
          username: userData.username || '',
          displayName: userData.display_name || userData.username || 'Unknown User',
          pfp: userData.pfp_url ? { url: userData.pfp_url } : undefined,
          profile: userData.profile,
          followerCount: userData.follower_count || 0,
          followingCount: userData.following_count || 0,
          following: userData.viewer_context?.following || false
        };
        
        setUserData(profile);
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [fid, numericFid]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-950 text-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent drop-shadow-glow"></div>
            <p className="mt-6 text-lg font-medium text-purple-100">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-950 text-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-8 text-center max-w-md mx-auto border border-red-900/30 shadow-lg">
            <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-red-900/20 flex items-center justify-center">
              <User2 className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">User not found</h2>
            <p className="text-gray-400 mb-6">{error || `The user with FID ${fid} does not exist or is not available.`}</p>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
              onClick={() => window.location.href = '/'}
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Profile header - spans full width */}
        <div className="bg-gradient-to-r from-gray-900 via-purple-950/20 to-gray-900 backdrop-blur-md rounded-2xl p-8 mb-10 shadow-xl border border-purple-900/20 transition-all duration-500 hover:shadow-purple-900/10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full blur-md opacity-70"></div>
                <Avatar className="relative h-28 w-28 md:h-36 md:w-36 rounded-full ring-2 ring-purple-600/50">
                  <AvatarImage src={userData.pfp?.url} alt={userData.displayName} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-700 to-purple-900">
                    <span className="text-2xl font-bold">{userData.displayName?.[0] || userData.username?.[0]}</span>
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                {userData.displayName}
              </h1>
              <p className="text-purple-300 text-lg mb-4">@{userData.username}</p>
              
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex items-center justify-center md:justify-start">
                  <span className="font-bold text-xl mr-2">{userData.followerCount.toLocaleString()}</span>
                  <span className="text-gray-400">Followers</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <span className="font-bold text-xl mr-2">{userData.followingCount.toLocaleString()}</span>
                  <span className="text-gray-400">Following</span>
                </div>
              </div>
              
              <p className="text-gray-300 mt-2 max-w-2xl mb-6 text-lg">{userData.profile?.bio?.text || ""}</p>
              
              {!isOwnProfile && (
                <Button 
                  className={`transition-all duration-300 ${
                    userData.following 
                      ? 'bg-gray-800 hover:bg-gray-700 border border-purple-500/30' 
                      : 'bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 shadow-lg hover:shadow-purple-900/20'
                  }`}
                >
                  {userData.following ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Music Stats - Left Column */}
          <div className="md:col-span-1">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-900/20 transition-all duration-300 hover:shadow-purple-900/10">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <Music className="mr-2 h-5 w-5 text-purple-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">Music Stats</span>
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/60 rounded-lg border border-purple-900/10 transition-all duration-300 hover:bg-gray-800/80 hover:border-purple-900/20">
                  <div className="text-purple-300 text-sm mb-1">Top Genre</div>
                  <div className="font-medium text-lg">Hip-Hop / Rap</div>
                </div>
                <div className="p-4 bg-gray-800/60 rounded-lg border border-purple-900/10 transition-all duration-300 hover:bg-gray-800/80 hover:border-purple-900/20">
                  <div className="text-purple-300 text-sm mb-1">Favorite Artist</div>
                  <div className="font-medium text-lg">A Tribe Called Quest</div>
                </div>
                <div className="p-4 bg-gray-800/60 rounded-lg border border-purple-900/10 transition-all duration-300 hover:bg-gray-800/80 hover:border-purple-900/20">
                  <div className="text-purple-300 text-sm mb-1">Listening Time</div>
                  <div className="font-medium text-lg">12.5 hours / week</div>
                </div>
                <div className="p-4 bg-gray-800/60 rounded-lg border border-purple-900/10 transition-all duration-300 hover:bg-gray-800/80 hover:border-purple-900/20">
                  <div className="text-purple-300 text-sm mb-1">Mood</div>
                  <div className="font-medium text-lg">Nostalgic</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Tracks - Right Column */}
          <div className="md:col-span-2">
            <div className="bg-[#121212] rounded-xl overflow-hidden">
              {/* Header */}
              <div className="px-5 pt-5 pb-4 flex items-center">
                <div className="flex items-center">
                  <Music className="h-5 w-5 text-purple-400 mr-3" />
                  <h2 className="text-2xl font-bold text-white">Top Tracks</h2>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="px-5 pb-4 flex gap-2">
                <button 
                  onClick={() => setTimeFrame("week")}
                  className={`px-5 py-2 rounded-full text-sm font-medium ${
                    timeFrame === "week" ? "bg-purple-600 text-white" : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333333]"
                  }`}
                >
                  Week
                </button>
                <button 
                  onClick={() => setTimeFrame("month")}
                  className={`px-5 py-2 rounded-full text-sm font-medium ${
                    timeFrame === "month" ? "bg-purple-600 text-white" : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333333]"
                  }`}
                >
                  Month
                </button>
                <button 
                  onClick={() => setTimeFrame("year")}
                  className={`px-5 py-2 rounded-full text-sm font-medium ${
                    timeFrame === "year" ? "bg-purple-600 text-white" : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333333]"
                  }`}
                >
                  Year
                </button>
              </div>
              
              {/* Track List */}
              <div className="px-2">
                {mockTracks[timeFrame].map((track: Track, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-center px-3 py-2.5 hover:bg-white/5 rounded-lg group mx-2 cursor-pointer"
                  >
                    {/* Track Number */}
                    <div className="w-8 text-center">
                      <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-400 to-purple-600`}>
                        {index + 1}
                      </span>
                    </div>
                    
                    {/* Album Art */}
                    <div className="w-12 h-12 ml-1 mr-3 rounded overflow-hidden shadow flex-shrink-0">
                      <img src={track.albumArt} alt={track.album} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Track Info */}
                    <div className="flex-grow min-w-0 mr-2">
                      <p className="text-white text-sm font-medium truncate">{track.name}</p>
                      <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                    </div>
                    
                    {/* Time Indicator */}
                    <div className="ml-auto flex items-center">
                      {/* Play Button (shows on hover) */}
                      <a 
                        href={`https://open.spotify.com/search/${encodeURIComponent(track.name + ' ' + track.artist)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 