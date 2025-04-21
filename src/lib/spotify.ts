// This is a utility file for working with the Spotify API

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';

// Map of registered Spotify redirect URIs - add all URIs that you've registered in Spotify Dashboard
const REGISTERED_REDIRECT_URIS = [
  'https://thescoho.ngrok.app/api/auth/callback/spotify',
  'http://localhost:3000/api/auth/callback/spotify',
  'https://thescoho.ngrok.app/api/spotify/callback', // Add alternate paths if registered
  'http://localhost:3000/api/spotify/callback'
];

// Determine the appropriate redirect URI based on current environment
function getAppropriateRedirectUri(): string {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    const protocol = window.location.protocol;
    
    // Build potential URIs based on current hostname
    const potentialUris = [
      `${protocol}//${hostname}${port}/api/auth/callback/spotify`,
      `${protocol}//${hostname}${port}/api/spotify/callback`
    ];
    
    // Find the first matching registered URI
    const matchedUri = potentialUris.find(uri => 
      REGISTERED_REDIRECT_URIS.includes(uri)
    );
    
    if (matchedUri) {
      console.log("Using detected redirect URI:", matchedUri);
      return matchedUri;
    }
  }
  
  // Default to a registered URI if we couldn't determine automatically
  // Using the first one in the list as default (presumably your production URI)
  console.log("Using default redirect URI:", REGISTERED_REDIRECT_URIS[0]);
  return REGISTERED_REDIRECT_URIS[0];
}

// Types for Spotify API responses
export interface SpotifyTrack {
  id: string;
  name: string;
  album: {
    id: string;
    name: string;
    images: { url: string }[];
  };
  artists: {
    id: string;
    name: string;
  }[];
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  images: { url: string }[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTopTrackResponse {
  items: SpotifyTrack[];
}

// Type for request body
export interface SpotifyRequestBody {
  [key: string]: string | number | boolean;
}

/**
 * Generates a random string for the state parameter in OAuth flow
 */
export function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * Get Spotify authorization URL for OAuth flow
 */
export function getSpotifyAuthUrl(): string {
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email user-top-read';
  
  // Get the appropriate redirect URI for the current environment
  const redirectUri = getAppropriateRedirectUri();
  
  console.log("Spotify Auth Parameters:", {
    clientId: SPOTIFY_CLIENT_ID,
    redirectUri: redirectUri
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: redirectUri,
    state
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function getSpotifyToken(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}> {
  // Use the same redirect URI determination logic
  const redirectUri = getAppropriateRedirectUri();
  
  console.log("Token exchange params:", {
    redirectUri
  });

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error(`Failed to get token: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Refresh an expired access token
 */
export async function refreshSpotifyToken(refreshToken: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch data from Spotify Web API
 */
export async function fetchSpotifyApi(endpoint: string, token: string, method = 'GET', body?: any) {
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get user's top tracks from Spotify
 */
export async function getUserTopTracks(token: string, timeRange = 'medium_term', limit = 5) {
  return fetchSpotifyApi(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`, token);
}

/**
 * Get user's profile from Spotify
 */
export async function getUserProfile(token: string) {
  return fetchSpotifyApi('/me', token);
}

// Map time ranges to Spotify API parameters
export const timeRangeMap = {
  'week': 'short_term', // Last 4 weeks
  'month': 'medium_term', // Last 6 months
  'year': 'long_term' // Several years of data
};

// Function to format the time range for UI display
export function formatTimeRange(timeRange: 'short_term' | 'medium_term' | 'long_term') {
  switch (timeRange) {
    case 'short_term':
      return 'Last 4 Weeks';
    case 'medium_term':
      return 'Last 6 Months';
    case 'long_term':
      return 'All Time';
    default:
      return 'Last 4 Weeks';
  }
}

// Function to convert our UI time frames to Spotify API time ranges
export function convertTimeFrameToRange(timeFrame: 'week' | 'month' | 'year'): 'short_term' | 'medium_term' | 'long_term' {
  switch (timeFrame) {
    case 'week':
      return 'short_term';
    case 'month':
      return 'medium_term';
    case 'year':
      return 'long_term';
    default:
      return 'short_term';
  }
}

// Function to get the correct Spotify redirect URI for your app
export function getSpotifyRedirectUri() {
  // Default to localhost for development
  return process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/spotify';
} 