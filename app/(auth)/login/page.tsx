"use client";

import { useEffect, useState, CSSProperties } from "react";
import { loginWithEmail, resolveEmailFromUsername, signInWithGoogle, resetPassword, verifyAuthConfig } from "@/lib/firebase";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import google from "@/public/google.png";
import toast, { Toaster } from 'react-hot-toast';
import { ScaleLoader } from "react-spinners";
import { GoogleAuthProvider } from "firebase/auth";

export default function LoginPage() {
  const { user } = useUser();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const spinnerOverride: CSSProperties = {
    display: "block",
    margin: "0 auto",
  };

  useEffect(() => {
    if (user) {
      console.log("Login page: User is authenticated, redirecting...");
      const redirectPath = localStorage.getItem('authRedirectPath') || '/studio';
      localStorage.removeItem('authRedirectPath');
      console.log("Login page: Redirecting to:", redirectPath);
      router.push(redirectPath);
    }
  }, [user, router]);

  // Verify Firebase auth config on mount
  useEffect(() => {
    verifyAuthConfig();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!identifier || !pwd) {
      toast.error("Please fill in both fields.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Login page: Attempting login...");
      const email = await resolveEmailFromUsername(identifier);
      await loginWithEmail(email, pwd);
      toast.success("Logged in successfully!");
      
      // Check for redirect path or default to studio
      const redirectPath = localStorage.getItem('authRedirectPath') || '/studio';
      localStorage.removeItem('authRedirectPath');
      console.log("Login page: Login successful, redirecting to:", redirectPath);
      router.push(redirectPath);
    } catch (err: any) {
      // Provide user-friendly error messages
      let errorMessage = "Login failed. Please try again.";
      
      if (err.code === "auth/invalid-credential") {
        errorMessage = "Incorrect email or password.";
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this username/email.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({display: 'popup'})
      const result = await signInWithGoogle(provider);
      if (result?.user) {
        toast.success("Signed in with Google successfully!");
        
        // Check for redirect path or default to studio
        const redirectPath = localStorage.getItem('authRedirectPath') || '/studio';
        localStorage.removeItem('authRedirectPath');
        console.log("Login page: Google login successful, redirecting to:", redirectPath);
        router.push(redirectPath);
      }
    } catch (err: any) {
      let errorMessage = "Google sign-in failed. Please try again.";
      
      if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in was cancelled. Please try again.";
      } else if (err.code === "auth/popup-blocked") {
        errorMessage = "Pop-up was blocked. Please allow pop-ups for this site.";
      } else if (err.code === "auth/cancelled-popup-request") {
        errorMessage = "Sign-in was cancelled. Please try again.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!identifier) {
      toast.error("Please enter your email address above", {
        id: "reset-error-email",
        duration: 4000
      });
      return;
    }
    
    // Show loading toast that we'll update later
    const loadingToastId = toast.loading("Sending password reset email...", {
      duration: 10000 // Long duration since we'll dismiss it manually
    });
    
    setIsResetLoading(true);
    
    try {
      // Validate email format client-side first
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        throw { code: "auth/invalid-email" };
      }
      
      // Try to send the reset email
      console.log("Attempting password reset for:", identifier);
      
      // Import directly from firebase to ensure we're using the right function
      const result = await resetPassword(identifier);
      console.log("Reset email result:", result);
      
      // Success - update the loading toast
      toast.success(`Reset link sent to ${identifier}. Check your inbox and spam folder.`, {
        id: loadingToastId,
        duration: 5000
      });
      
      // Clear the email field to indicate success
      setIdentifier("");
    } catch (err: any) {
      console.error("Password reset error:", err);
      
      // Create a detailed error log
      if (err.code) console.log("Error code:", err.code);
      if (err.message) console.log("Error message:", err.message);
      if (err.name) console.log("Error name:", err.name);
      
      // Handle specific error cases
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (err.code === "auth/user-not-found") {
        // We don't want to reveal if an email exists or not for security reasons
        // So we show a generic success message even if the email doesn't exist
        toast.success(`If an account exists for ${identifier}, a password reset link will be sent.`, {
          id: loadingToastId,
          duration: 5000
        });
        setIsResetLoading(false);
        return;
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (err.code === "auth/missing-continue-uri") {
        errorMessage = "Configuration error. Please contact support.";
      } else if (err.code === "auth/unauthorized-continue-uri") {
        errorMessage = "The redirect URL is not authorized. Please contact support.";
      } else if (err.code) {
        errorMessage = `Error: ${err.code}`;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      // Error - update the loading toast to error
      toast.error(errorMessage, {
        id: loadingToastId,
        duration: 4000
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center bg-black text-white px-4 py-12">
        <div className="flex items-center justify-center gap-x-4">
        <div className="size-12 text-[#135feb]">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
          </svg>
        </div>
          <h1 className="font-semibold text-5xl">LakeNine.Ai</h1>
        </div>
        
        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="bg-[#1a1a1a] p-12 my-8 rounded-xl w-[30rem] space-y-4 shadow-lg"
        >
          <label className="text-sm font-medium">Username or Email</label>
          <input
            type="text"
            name="identifier"
            id="identifier"
            autoComplete="username"
            placeholder="Your username or email"
            className="w-full px-4 py-3 text-white bg-[#222630] rounded-lg border-2 border-solid border-[#2B3040] outline-none focus:border-[#596A95] transition-colors duration-200"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            autoComplete="current-password"
            placeholder="Your password"
            className="w-full px-4 py-3 text-white bg-[#222630] rounded-lg border-2 border-solid border-[#2B3040] outline-none focus:border-[#596A95] transition-colors duration-200"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-white text-black py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center min-h-[40px]"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <ScaleLoader
                color="#000000"
                loading={isLoading}
                height={10}
                width={10}
                aria-label="Loading Spinner"
              />
            ) : (
              "Continue"
            )}
          </button>

          {/* OR Divider */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <hr className="flex-grow border-gray-600" />
            <span>OR</span>
            <hr className="flex-grow border-gray-600" />
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#2B3040] hover:bg-[#343b52] transition-colors duration-200 rounded-lg border border-solid border-[#374151]"
          >
            {isGoogleLoading ? (
              <ScaleLoader
                color="#ffffff"
                loading={true}
                cssOverride={spinnerOverride}
                height={15}
                width={3}
                radius={1}
                margin={2}
              />
            ) : (
              <>
                <Image alt="Google" src={google} width={20} height={20} />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Sign-up Link */}
          <div className="text-center text-sm text-gray-400 mt-2">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-purple-400 hover:text-blue-300"
            >
              Sign up
            </Link>
          </div>

          <div className="text-center text-sm text-gray-400 mt-2">
            Forget your password?{" "}
            <button
              onClick={handleResetPassword}
              className="text-purple-400 hover:text-blue-300"
              disabled={isResetLoading}
            >
              {isResetLoading ? "Sending..." : "Reset password"}
            </button>
          </div>
        </form>
        <Toaster position="top-center" />
      </div>
    </>
  )
}
