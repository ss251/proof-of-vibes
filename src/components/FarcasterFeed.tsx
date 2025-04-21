"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "./ui/Button";
import Link from "next/link";

type User = {
  fid: number;
  username: string;
  display_name?: string;
  pfp_url?: string;
  follower_count: number;
  following_count: number;
};

type FollowerResponse = {
  users: {
    object: string;
    user: User;
  }[];
  next?: {
    cursor: string;
  };
};

export default function FarcasterFeed() {
  const { data: session, status } = useSession();
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [followersCursor, setFollowersCursor] = useState<string | null>(null);
  const [followingCursor, setFollowingCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user's FID from session
  const userFid = session?.user?.fid;

  // Fetch users by FIDs
  const fetchUsers = useCallback(async () => {
    if (!userFid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch some example FIDs (3, 2, 1) along with the current user
      const fids = [userFid, 3, 2, 1];
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fids }),
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data?.users && Array.isArray(data.users)) {
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [userFid]);

  // Fetch followers for the current user
  const fetchUserFollowers = useCallback(async (cursor?: string) => {
    if (!userFid) return;
    
    const isLoadingMore = !!cursor;
    if (!isLoadingMore) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    
    try {
      // Build API URL with cursor if provided
      let url = `/api/followers?fid=${userFid}&limit=20`;
      if (cursor) {
        url += `&cursor=${encodeURIComponent(cursor)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching followers: ${response.statusText}`);
      }
      
      const data = await response.json() as FollowerResponse;
      
      // Extract users from the follower objects
      const newFollowers = data.users.map(item => item.user);
      
      // Update cursor for pagination
      setFollowersCursor(data.next?.cursor || null);
      
      // Append to existing followers if loading more, otherwise replace
      if (isLoadingMore) {
        setFollowers(prev => [...prev, ...newFollowers]);
      } else {
        setFollowers(newFollowers);
      }
    } catch (err) {
      console.error("Error fetching followers:", err);
      setError("Failed to fetch followers");
    } finally {
      if (!isLoadingMore) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [userFid]);

  // Fetch following for the current user
  const fetchUserFollowing = useCallback(async (cursor?: string) => {
    if (!userFid) return;
    
    const isLoadingMore = !!cursor;
    if (!isLoadingMore) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    
    try {
      // Build API URL with cursor if provided
      let url = `/api/following?fid=${userFid}&limit=20`;
      if (cursor) {
        url += `&cursor=${encodeURIComponent(cursor)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching following: ${response.statusText}`);
      }
      
      const data = await response.json() as FollowerResponse;
      
      // Extract users from the following objects
      const newFollowing = data.users.map(item => item.user);
      
      // Update cursor for pagination
      setFollowingCursor(data.next?.cursor || null);
      
      // Append to existing following if loading more, otherwise replace
      if (isLoadingMore) {
        setFollowing(prev => [...prev, ...newFollowing]);
      } else {
        setFollowing(newFollowing);
      }
    } catch (err) {
      console.error("Error fetching following:", err);
      setError("Failed to fetch following");
    } finally {
      if (!isLoadingMore) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [userFid]);

  // Load more followers
  const loadMoreFollowers = useCallback(() => {
    if (followersCursor) {
      fetchUserFollowers(followersCursor);
    }
  }, [followersCursor, fetchUserFollowers]);
  
  // Load more following
  const loadMoreFollowing = useCallback(() => {
    if (followingCursor) {
      fetchUserFollowing(followingCursor);
    }
  }, [followingCursor, fetchUserFollowing]);

  // Load data when session is available
  useEffect(() => {
    if (status === "authenticated" && userFid) {
      console.log("Session data:", session);
      console.log("Session user FID:", userFid);
      
      fetchUsers();
      fetchUserFollowers();
      fetchUserFollowing();
    }
  }, [status, userFid, fetchUsers, fetchUserFollowers, fetchUserFollowing, session]);

  if (status === "loading") {
    return <div>Loading session...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please sign in with Farcaster first</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Farcaster Data</h2>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {loading ? (
        <div>Loading data...</div>
      ) : (
        <div className="space-y-8">
          
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Followers ({followers.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {followers.map((follower) => (
                <Link 
                  href={`/profile/${follower.fid}`} 
                  key={`follower-${follower.fid}`} 
                  className="border rounded-lg p-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  {follower.pfp_url ? (
                    <img
                      src={follower.pfp_url}
                      alt={follower.username}
                      className="h-10 w-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded-full mr-3" />
                  )}
                  <div>
                    <div className="font-medium">{follower.display_name || follower.username}</div>
                    <div className="text-gray-500 text-sm">@{follower.username}</div>
                  </div>
                </Link>
              ))}
              {followers.length === 0 && <div>No followers found</div>}
            </div>
            {followersCursor && (
              <div className="mt-4 text-center">
                <Button 
                  onClick={loadMoreFollowers} 
                  disabled={loadingMore}
                  variant="outline"
                >
                  {loadingMore ? "Loading..." : "Load More Followers"}
                </Button>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Following ({following.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {following.map((follow) => (
                <Link 
                  href={`/profile/${follow.fid}`} 
                  key={`following-${follow.fid}`} 
                  className="border rounded-lg p-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  {follow.pfp_url ? (
                    <img
                      src={follow.pfp_url}
                      alt={follow.username}
                      className="h-10 w-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded-full mr-3" />
                  )}
                  <div>
                    <div className="font-medium">{follow.display_name || follow.username}</div>
                    <div className="text-gray-500 text-sm">@{follow.username}</div>
                  </div>
                </Link>
              ))}
              {following.length === 0 && <div>Not following anyone</div>}
            </div>
            {followingCursor && (
              <div className="mt-4 text-center">
                <Button 
                  onClick={loadMoreFollowing} 
                  disabled={loadingMore}
                  variant="outline"
                >
                  {loadingMore ? "Loading..." : "Load More Following"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 