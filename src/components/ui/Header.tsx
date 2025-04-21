"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./Button";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Define user type based on Neynar API response
type NeynarUser = {
  fid: number;
  username: string;
  display_name?: string;
  pfp_url?: string;
};

// Dynamically import the sign in component
const SignInButton = dynamic(() => import("../SignInWithFarcaster"), {
  ssr: false,
  loading: () => (
    <Button className="bg-[#B69BC7] hover:bg-[#a78ab6] text-white opacity-70">
      Loading...
    </Button>
  ),
});

export function Header() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<NeynarUser | null>(null);
  
  // Fetch user data when session is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.fid) return;
      
      try {
        const response = await fetch(`/api/users?fid=${session.user.fid}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.users && data.users[0]) {
          setUserData(data.users[0]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    if (status === "authenticated") {
      fetchUserData();
    }
  }, [session, status]);
  
  const handleSignOut = async () => {
    await signOut({ redirect: false });
  };

  return (
    <header className="w-full py-4 px-4 md:px-8 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image 
            src="/opengraph.svg" 
            alt="Proof of Vibes" 
            width={140} 
            height={40} 
            className="h-10 w-auto"
          />
        </Link>
        
        <div className="flex items-center gap-4">
          {status === "authenticated" ? (
            <div className="flex items-center gap-4">
              <Link href="/connect-spotify" className="hidden md:block">
                <Button className="bg-[#B69BC7] hover:bg-[#a78ab6] text-white">
                  Connect Spotify
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage 
                      src={userData?.pfp_url || ""} 
                      alt={userData?.display_name || userData?.username || "User"} 
                    />
                    <AvatarFallback>
                      {(userData?.username?.[0] || userData?.display_name?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${session?.user?.fid}`}>Your Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/connect-spotify">Connect Spotify</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </header>
  );
} 