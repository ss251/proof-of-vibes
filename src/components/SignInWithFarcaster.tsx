"use client";

import { useCallback, useState } from "react";
import { signIn, signOut, getCsrfToken, useSession } from "next-auth/react";
import sdk, { SignIn as SignInCore } from "@farcaster/frame-sdk";
import { Button } from "./ui/Button";

// Define extended type for Farcaster sign-in result
type ExtendedSignInResult = SignInCore.SignInResult & {
  name?: string;
  pfp?: string;
  username?: string;
  fid?: number;
};

export default function SignInWithFarcaster() {
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const { status } = useSession();

  const getNonce = useCallback(async () => {
    try {
      const nonce = await getCsrfToken();
      console.log("CSRF token retrieved:", nonce ? "success" : "null");
      if (!nonce) {
        throw new Error("Unable to generate CSRF token");
      }
      return nonce;
    } catch (error) {
      console.error("Error getting CSRF token:", error);
      throw error;
    }
  }, []);

  const handleSignIn = useCallback(async () => {
    try {
      console.log("Starting sign in process...");
      setSigningIn(true);
      setSignInError(null);
      
      // Step 1: Get CSRF token
      let nonce;
      try {
        nonce = await getNonce();
        console.log("Got nonce:", nonce);
      } catch (nonceError) {
        setSignInError("CSRF token error. Please try again.");
        console.error("Nonce error:", nonceError);
        return;
      }
      
      // Step 2: Trigger Farcaster sign-in
      const rawSignInResult = await sdk.actions.signIn({ nonce });
      console.log("Sign in result from SDK:", rawSignInResult);
      
      // Cast to extended type to access additional properties
      const signInResult = rawSignInResult as ExtendedSignInResult;
      
      // Step 3: Extract FID from message if available
      let fidFromResources;
      if (signInResult.message && signInResult.message.includes('farcaster://fid/')) {
        const resourcesMatch = signInResult.message.match(/farcaster:\/\/fid\/(\d+)/);
        fidFromResources = resourcesMatch ? resourcesMatch[1] : undefined;
        console.log("Extracted FID from resources:", fidFromResources);
      }
      
      // Step 4: Call NextAuth sign-in
      const signInResponse = await signIn("credentials", {
        message: signInResult.message,
        signature: signInResult.signature,
        // Use extended properties if available
        name: signInResult.name,  
        pfp: signInResult.pfp,
        username: signInResult.username,
        fid: fidFromResources || signInResult.fid?.toString(),
        redirect: false,
        callbackUrl: "/",
      });
      
      console.log("Sign in response from NextAuth:", signInResponse);
      
      if (signInResponse?.error) {
        setSignInError(`Authentication error: ${signInResponse.error}`);
      }
    } catch (error) {
      if (error instanceof SignInCore.RejectedByUser) {
        setSignInError("Sign in was rejected");
        console.error("Sign in rejected by user");
        return;
      }

      setSignInError("Failed to sign in. Please try again.");
      console.error("Sign in error:", error);
    } finally {
      setSigningIn(false);
    }
  }, [getNonce]);

  const handleSignOut = useCallback(async () => {
    try {
      setSigningOut(true);
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setSigningOut(false);
    }
  }, []);

  if (status === "authenticated") {
    return (
      <Button 
        onClick={handleSignOut} 
        disabled={signingOut}
        variant="outline"
        className="text-gray-300"
      >
        {signingOut ? "Signing out..." : "Sign out"}
      </Button>
    );
  }

  return (
    <div>
      <Button 
        onClick={handleSignIn} 
        disabled={signingIn}
        className="bg-[#B69BC7] hover:bg-[#a78ab6]"
      >
        {signingIn ? "Signing in..." : "Sign in with Farcaster"}
      </Button>
      
      {signInError && (
        <p className="text-red-500 text-sm mt-2">{signInError}</p>
      )}
    </div>
  );
} 