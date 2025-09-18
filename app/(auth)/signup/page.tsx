"use client";
import { useState, useEffect, CSSProperties } from "react";
import { registerWithEmailAndUsername, signUpWithGoogle, verifyAuthConfig } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import googleImg from "../login/google.jpg";
import Image from "next/image";
import toast, { Toaster } from 'react-hot-toast';
import { ScaleLoader } from "react-spinners";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const spinnerOverride: CSSProperties = {
    display: "block",
    margin: "0 auto",
  };

  // Verify Firebase auth config on mount
  useEffect(() => {
    verifyAuthConfig();
  }, []);

  // Password strength checker
  useEffect(() => {
    if (!pwd) {
      setPasswordStrength(null);
      return;
    }

    const hasNumber = /\d/.test(pwd);
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const isLongEnough = pwd.length >= 8;

    if (hasNumber && hasUpperCase && hasLowerCase && hasSpecialChar && isLongEnough) {
      setPasswordStrength("strong");
    } else if ((hasNumber && hasUpperCase && hasLowerCase) ||
      (hasNumber && hasUpperCase && hasSpecialChar) ||
      (hasNumber && hasLowerCase && hasSpecialChar) ||
      (hasUpperCase && hasLowerCase && hasSpecialChar)) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("weak");
    }
  }, [pwd]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !pwd || !username.trim()) {
      toast.error("Email, username & password required");
      setIsLoading(false);
      return;
    }

    if (passwordStrength !== "strong") {
      toast.error("Please choose a stronger password");
      setIsLoading(false);
      return;
    }

    try {
      await registerWithEmailAndUsername(email, pwd, username);
      toast.success("Account created successfully!");
      router.push("/login"); // Redirect to login after signup
    } catch (err: any) {
      let errorMessage = "Failed to create account. Please try again.";

      if (err.code === "auth/username-already-in-use") {
        errorMessage = "This username is already taken.";
      } else 
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered.";
        toast.error(
          (t) => (
            <div className="flex flex-col gap-2">
              <span>This email is already registered.</span>
              <button
                onClick={() => {
                  router.push("/login");
                  toast.dismiss(t.id);
                }}
                className="bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600"
              >
                Sign in instead
              </button>
            </div>
          ),
          { duration: 5000 }
        );
        setIsLoading(false);
        return;
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Email/password accounts are not enabled. Please contact support.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Please choose a stronger password.";
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
      // Use Google popup authentication
      const result = await signUpWithGoogle();
      if (result?.user) {
        if (result.isNewUser) {
          toast.success("Account created with Google successfully!");
        } else {
          toast.success("Signed in with existing Google account!");
        }
        router.push("/");
      }
    } catch (err: any) {
      let errorMessage = "Google sign-up failed. Please try again.";
      
      if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-up was cancelled. Please try again.";
      } else if (err.code === "auth/popup-blocked") {
        errorMessage = "Pop-up was blocked. Please allow pop-ups for this site.";
      } else if (err.code === "auth/cancelled-popup-request") {
        errorMessage = "Sign-up was cancelled. Please try again.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <div className=" min-h-screen flex flex-col items-center px-4 py-12 bg-cover bg-center relative text-gray-900" style={{ backgroundImage: "url('/bg.jpg')" }}>
        <div className="main-container absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
        <div className=" flex items-center justify-center gap-x-4 relative z-10">
        <div className="size-12 text-[#135feb]">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
          </svg>
        </div>
          <h1 className="font-semibold text-5xl text-gray-900">CouncellorX</h1>
        </div>
        <form
          onSubmit={handleSignup}
          className="main-container p-12 my-8 rounded-xl w-[30rem] space-y-4 shadow-xl relative z-10 bg-white/60 backdrop-blur-md border border-white/50"
        >
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <label className="text-sm font-medium">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            autoComplete="username"
            placeholder="Choose a unique username"
            className="w-full px-4 py-3 text-gray-900 bg-white/70 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:bg-white transition-colors duration-200"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            placeholder="Your email address"
            className="w-full px-4 py-3 text-gray-900 bg-white/70 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:bg-white transition-colors duration-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            autoComplete="new-password"
            placeholder="Choose a password"
            className="w-full px-4 py-3 text-gray-900 bg-white/70 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:bg-white transition-colors duration-200"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />

          {/* Password Strength Indicator */}
          {pwd && (
            <div className="mt-1">
              <div className="flex items-center">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength === "weak" ? "w-1/3 bg-red-500" :
                        passwordStrength === "medium" ? "w-2/3 bg-yellow-500" :
                          passwordStrength === "strong" ? "w-full bg-green-500" : ""
                      }`}
                  ></div>
                </div>
                <span className={`ml-2 text-sm font-medium transition-all duration-300 ${passwordStrength === "weak" ? "text-red-600" :
                    passwordStrength === "medium" ? "text-yellow-600" :
                      passwordStrength === "strong" ? "text-green-600" : ""
                  }`}>
                  {passwordStrength === "weak" ? "Weak" :
                    passwordStrength === "medium" ? "Medium" :
                      passwordStrength === "strong" ? "Strong" : ""}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Password must be at least 8 characters with numbers, uppercase, lowercase, and special characters
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center min-h-[40px]"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <ScaleLoader
                color="#ffffff"
                loading={isLoading}
                cssOverride={spinnerOverride}
                height={10}
                width={10}
                aria-label="Loading Spinner"
              />
            ) : (
              "Create Account"
            )}
          </button>

          {/* OR Divider */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <hr className="flex-grow border-gray-200" />
            <span>OR</span>
            <hr className="flex-grow border-gray-200" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white/80 hover:bg-white transition-colors duration-200 rounded-lg border border-solid border-gray-300"
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ScaleLoader
                color="#4b5563"
                loading={true}
                cssOverride={spinnerOverride}
                height={15}
                width={3}
                radius={1}
                margin={2}
              />
            ) : (
              <>
                <Image src={googleImg} height={20} width={20} alt="google-signup" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Login Redirect */}
          <div className="text-center text-sm text-gray-700 mt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              Log in
            </Link>
          </div>
        </form>
        <Toaster position="top-center" />
      </div>
    </>
  );
}
