"use client";

// Define FarcasterUserProfile type directly here instead of importing it
export type FarcasterUserProfile = {
  fid: number;
  username: string;
  displayName?: string;
  pfp?: { url: string };
  followerCount?: number;
  followingCount?: number;
};

// Log that the client-side Neynar module was loaded
console.log("Client-side Neynar module loaded");

/**
 * Client-side utility functions for interacting with Neynar API through our API routes
 * This avoids using the Node.js SDK directly in the browser
 */

/**
 * Fetch data about multiple users by their FIDs
 */
export async function fetchUsersByFids(fids: number[]) {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fids }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch users: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Fetch data about a single user by FID
 */
export async function fetchUserByFid(fid: number, viewerFid?: number) {
  try {
    const params = new URLSearchParams({ fid: fid.toString() });
    if (viewerFid) {
      params.append('viewer_fid', viewerFid.toString());
    }

    const response = await fetch(`/api/users?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch user: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Fetch followers for a user
 */
export async function fetchFollowers(fid: number, limit: number = 25, cursor?: string) {
  try {
    const params = new URLSearchParams({ 
      fid: fid.toString(),
      limit: limit.toString()
    });
    
    if (cursor) {
      params.append('cursor', cursor);
    }

    const response = await fetch(`/api/followers?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch followers: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error;
  }
}

/**
 * Fetch following for a user
 */
export async function fetchFollowing(fid: number, limit: number = 25, cursor?: string) {
  try {
    const params = new URLSearchParams({ 
      fid: fid.toString(),
      limit: limit.toString()
    });
    
    if (cursor) {
      params.append('cursor', cursor);
    }

    const response = await fetch(`/api/following?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch following: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching following:', error);
    throw error;
  }
} 