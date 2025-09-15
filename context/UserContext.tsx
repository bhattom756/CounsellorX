"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  auth,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
  initializeBrowserSession,
  markAuthActive,
  clearAuthMarkers,
  setupPageUnloadDetection,
} from "@/lib/firebase";
// import { useAuthState } from 'react-firebase-hooks/auth';
import { useAuthState } from "react-firebase-hooks/auth";

interface UserContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: Error | undefined;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: undefined,
  login: async () => {},
  logout: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  // Use react-firebase-hooks for auth state
  const [authUser, loading, error] = useAuthState(auth);
  
  // Convert undefined to null to match our interface
  const user = authUser ?? null;

  // Initialize browser session tracking after auth state is determined
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Always run session tracking, regardless of loading state
        // This ensures we catch new browser sessions immediately
        await initializeBrowserSession();
        console.log("UserContext: Browser session tracking initialized");
      } catch (error) {
        console.error("UserContext: Error initializing browser session:", error);
      }
    };

    initializeSession();
  }, []); // Run once on mount

  // Set up page unload detection
  useEffect(() => {
    const cleanup = setupPageUnloadDetection();
    return cleanup; // Cleanup on unmount
  }, []);

  // For debugging and session management
  useEffect(() => {
    if (user) {
      console.log("UserContext: Auth state changed - user signed in:", user.email);
      // Store user info for debugging
      localStorage.setItem('userEmail', user.email || '');
      localStorage.setItem('userId', user.uid);
      // Mark authentication as active
      markAuthActive();
    } else if (!loading) {
      console.log("UserContext: Auth state changed - user signed out");
      // Clear stored user info
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('userToken');
      sessionStorage.clear();
      // Clear authentication markers
      clearAuthMarkers();
    }
  }, [user, loading]);

  const login = async (email: string, password: string) => {
    try {
      console.log("UserContext: Attempting login for:", email);
      await signInWithEmailAndPassword(auth, email, password);
      // Mark authentication as active
      markAuthActive();
      console.log("UserContext: Login successful");
    } catch (error) {
      console.error("Login error in UserContext:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("UserContext: Attempting logout");
      
      // Clear all session data first
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('userToken');
      sessionStorage.clear();
      
      // Clear authentication markers
      clearAuthMarkers();
      
      // Sign out from Firebase
      await signOut(auth);
      console.log("UserContext: Logout successful");
    } catch (error) {
      console.error("Logout error in UserContext:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
