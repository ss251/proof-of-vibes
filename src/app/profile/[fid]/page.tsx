"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Header } from "~/components/ui/Header";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/Button";
import { Clock, Music } from "lucide-react";

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
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#B69BC7] border-r-transparent"></div>
            <p className="mt-4">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !userData) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">User not found</h2>
            <p className="text-gray-400">{error || `The user with FID ${fid} does not exist or is not available.`}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="md:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={userData.pfp?.url} alt={userData.displayName} />
                  <AvatarFallback>{userData.displayName?.[0] || userData.username?.[0]}</AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">{userData.displayName}</h1>
                <p className="text-gray-400">@{userData.username}</p>
                <p className="text-gray-400 text-sm mt-1">FID: {userData.fid}</p>
                <p className="mt-4 text-sm">{userData.profile?.bio?.text || ""}</p>
              </div>
              
              <div className="flex justify-around text-center mb-6">
                <div>
                  <p className="font-bold">{userData.followerCount.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">Followers</p>
                </div>
                <div>
                  <p className="font-bold">{userData.followingCount.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">Following</p>
                </div>
              </div>
              
              {/* Only show follow button if not viewing own profile */}
              {!isOwnProfile && (
                <Button 
                  className={`w-full ${userData.following ? 'bg-gray-800 hover:bg-gray-700' : 'bg-[#B69BC7] hover:bg-[#a78ab6]'}`}
                >
                  {userData.following ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
          </div>
          
          {/* Top Tracks */}
          <div className="md:col-span-2">
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Music className="mr-2 h-5 w-5" />
                  Top Tracks
                </h2>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setTimeFrame("week")}
                    variant={timeFrame === "week" ? "default" : "outline"}
                    className={timeFrame === "week" ? "bg-[#B69BC7] hover:bg-[#a78ab6]" : ""}
                    size="sm"
                  >
                    Week
                  </Button>
                  <Button
                    onClick={() => setTimeFrame("month")}
                    variant={timeFrame === "month" ? "default" : "outline"}
                    className={timeFrame === "month" ? "bg-[#B69BC7] hover:bg-[#a78ab6]" : ""}
                    size="sm"
                  >
                    Month
                  </Button>
                  <Button
                    onClick={() => setTimeFrame("year")}
                    variant={timeFrame === "year" ? "default" : "outline"}
                    className={timeFrame === "year" ? "bg-[#B69BC7] hover:bg-[#a78ab6]" : ""}
                    size="sm"
                  >
                    Year
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {mockTracks[timeFrame].map((track: Track, index: number) => (
                  <div key={index} className="flex items-center p-3 bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0 mr-4 text-lg font-bold text-gray-400 w-6 text-center">
                      {index + 1}
                    </div>
                    <div className="flex-shrink-0 mr-4">
                      <img src={track.albumArt} alt={track.album} className="h-16 w-16 rounded-md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{track.name}</p>
                      <p className="text-gray-400 text-sm">{track.artist}</p>
                      <p className="text-gray-500 text-xs">{track.album}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center text-gray-400 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>This {timeFrame}</span>
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