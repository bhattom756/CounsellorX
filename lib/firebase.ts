import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  User,
  setPersistence,
  browserLocalPersistence,
  signInWithCredential,
  browserPopupRedirectResolver
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyDK_J3yegXTPPaBs_PJKJhlChKejf4WKMg",
  authDomain: "councellorx.firebaseapp.com",
  projectId: "councellorx",
  storageBucket: "councellorx.firebasestorage.app",
  messagingSenderId: "437235882079",
  appId: "1:437235882079:web:be8aaec53a139d517de3ea"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error("Error setting auth persistence:", error);
    });
}

isSupported().then((yes) => {
  if (yes && typeof window !== "undefined") {
    getAnalytics(app);
  }
});

const SESSION_KEY = 'firebase_browser_session';
const AUTH_ACTIVE_KEY = 'firebase_auth_active';
const SESSION_TIMESTAMP_KEY = 'firebase_session_timestamp';

const isNewBrowserSession = () => {
  if (typeof window === 'undefined') return false;
  
  const sessionExists = sessionStorage.getItem(SESSION_KEY);
  const sessionTimestamp = sessionStorage.getItem(SESSION_TIMESTAMP_KEY);
  
  if (!sessionExists || !sessionTimestamp) {
    return true;
  }
  
  const now = Date.now();
  const sessionTime = parseInt(sessionTimestamp, 10);
  const timeDiff = now - sessionTime;
  
  if (timeDiff > 24 * 60 * 60 * 1000) {
    return true;
  }
  
  return false;
};

const initializeBrowserSession = async () => {
  if (typeof window === 'undefined') return;
  
  const isNewSession = isNewBrowserSession();
  const wasAuthActive = localStorage.getItem(AUTH_ACTIVE_KEY);
  
  console.log('Session tracking debug:', {
    isNewSession,
    wasAuthActive,
    sessionStorage: !!sessionStorage.getItem(SESSION_KEY),
    timestamp: sessionStorage.getItem(SESSION_TIMESTAMP_KEY),
    currentUser: auth.currentUser?.email || 'none'
  });
  
  sessionStorage.setItem(SESSION_KEY, 'active');
  sessionStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
  
  console.log('🔄 Session markers set for new browser session');
};

const markAuthActive = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_ACTIVE_KEY, 'true');
  sessionStorage.setItem(SESSION_KEY, 'active');
  sessionStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
};

const clearAuthMarkers = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_ACTIVE_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_TIMESTAMP_KEY);
};

const setupPageUnloadDetection = () => {
  if (typeof window === 'undefined') return;
  
  const handleBeforeUnload = () => {
    console.log('Page unload detected - maintaining auth state for potential refresh');
  };
  
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log('Page hidden - tab switched or minimized');
    } else {
      console.log('Page visible - tab focused');
      if (auth.currentUser && localStorage.getItem(AUTH_ACTIVE_KEY)) {
        sessionStorage.setItem(SESSION_KEY, 'active');
        sessionStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
      }
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

const isUsernameAvailable = async (username: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  return !snap.exists();
};

const registerWithEmailAndUsername = async (email: string, password: string, username: string) => {
  const normalizedUsername = username.trim().toLowerCase();
  if (!normalizedUsername) {
    throw new Error('Username is required');
  }

  const result = await createUserWithEmailAndPassword(auth, email, password);

  const { updateProfile, deleteUser } = await import('firebase/auth');

  try {
    await runTransaction(db, async (tx) => {
      const usernameRef = doc(db, 'usernames', normalizedUsername);
      const profileRef = doc(db, 'users', result.user.uid);
      const existing = await tx.get(usernameRef);
      if (existing.exists()) {
        throw Object.assign(new Error('Username already taken'), { code: 'auth/username-already-in-use' });
      }
      tx.set(usernameRef, {
        uid: result.user.uid,
        email,
        createdAt: serverTimestamp()
      });
      tx.set(profileRef, {
        uid: result.user.uid,
        email,
        username,
        createdAt: serverTimestamp()
      });
    });

    try {
      await updateProfile(result.user, { displayName: username });
    } catch (e) {
      console.warn('Failed to set displayName on profile:', e);
    }

    markAuthActive();
    return result;
  } catch (err: any) {
    try {
      await deleteUser(result.user);
    } catch (rollbackErr) {
      console.warn('Failed to rollback auth user after username error:', rollbackErr);
    }
    if (err?.code === 'auth/username-already-in-use') {
      throw err;
    }
    throw err;
  }
};

const loginWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  markAuthActive();
  return result;
};

const resolveEmailFromUsername = async (input: string): Promise<string> => {
  const candidate = input.trim();
  if (!candidate) throw new Error('Missing login identifier');
  if (candidate.includes('@')) return candidate;
  const snap = await getDoc(doc(db, 'usernames', candidate.toLowerCase()));
  if (!snap.exists()) {
    const err: any = new Error('Username not found');
    err.code = 'auth/user-not-found';
    throw err;
  }
  const data = snap.data() as { email?: string };
  if (!data?.email) throw new Error('Username mapping invalid');
  return data.email;
};

const signInWithGoogle = async () => {
  try {
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      login_hint: localStorage.getItem('lastEmail') || ''
    });
    
    const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    
    if (result.user.email) {
      localStorage.setItem('lastEmail', result.user.email);
    }
    
    markAuthActive();
    const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
    return { user: result.user, isNewUser };
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

const handleRedirectResult = async () => {
  if (typeof window === 'undefined') return null;
  
  try {
    console.log("Checking for Google redirect result...");
    console.log("Current URL:", window.location.href);
    console.log("Provider ID:", googleProvider.providerId);
    
    if (auth.currentUser) {
      console.log("User already signed in:", auth.currentUser.email);
      if (auth.currentUser.email) {
        localStorage.setItem('lastEmail', auth.currentUser.email);
      }
      markAuthActive();
      const isNewUser = auth.currentUser.metadata.creationTime === auth.currentUser.metadata.lastSignInTime;
      return { user: auth.currentUser, isNewUser };
    }

    console.log("No current user, checking redirect result...");
    
    try {
      const result = await getRedirectResult(auth);
      
      if (result && result.user) {
        console.log("Successfully got Google redirect result:", result.user.email);
        
        if (result.user.email) {
          localStorage.setItem('lastEmail', result.user.email);
        }
        
        markAuthActive();
        const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
        
        return { user: result.user, isNewUser };
      } else {
        console.log("No redirect result found");
      }
    } catch (redirectError: any) {
      console.error("Error processing redirect result:", redirectError);
      if (redirectError.code === 'auth/credential-already-in-use') {
        console.log("Credential already in use, attempting to recover...");
        try {
          const recoveryCredential = GoogleAuthProvider.credentialFromError(redirectError);
          if (recoveryCredential) {
            const recoveryResult = await signInWithCredential(auth, recoveryCredential);
            console.log("Recovery successful:", recoveryResult.user.email);
            return { user: recoveryResult.user, isNewUser: false };
          }
        } catch (recoveryError) {
          console.error("Recovery failed:", recoveryError);
        }
      }
      throw redirectError;
    }
    
    return null;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
};

const signUpWithGoogle = async () => {
  return signInWithGoogle();
};

const sendLoginLink = async (email: string) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Email link authentication requires browser environment');
    }
    
    console.log("Preparing to send email login link to:", email);
    
    localStorage.setItem('emailForSignIn', email);
    
    const actionCodeSettings = {
      url: `${window.location.origin}/login`,
      handleCodeInApp: true,
    };
    
    console.log("Sending login link with settings:", actionCodeSettings);
    
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    console.log("Email login link sent successfully");
    
    return true;
  } catch (error: any) {
    console.error("Error sending login link:", error);
    
    if (error.code) {
      console.error("Error code:", error.code);
    }
    
    throw error;
  }
};

const checkIfEmailLink = (url: string = '') => {
  if (typeof window === 'undefined') return false;
  
  const linkToCheck = url || window.location.href;
  console.log("Checking if URL is email sign-in link:", linkToCheck);
  
  const result = isSignInWithEmailLink(auth, linkToCheck);
  console.log("Is email sign-in link:", result);
  
  return result;
};

const loginWithEmailLink = async (email: string = '', link: string = '') => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Email link authentication requires browser environment');
    }

    const emailToUse = email || localStorage.getItem('emailForSignIn');
    if (!emailToUse) {
      throw new Error('No email found for sign-in. Please provide your email again.');
    }
    
    // Get the link from the current URL if not provided
    const linkToUse = link || window.location.href;
    
    console.log("Attempting to sign in with email link:", {
      email: emailToUse,
      linkProvided: !!link
    });
    
    // Sign in with the link
    const result = await signInWithEmailLink(auth, emailToUse, linkToUse);
    
    // Clear the stored email
    localStorage.removeItem('emailForSignIn');
    
    // Mark authentication as active for browser session tracking
    markAuthActive();
    
    console.log("Email link sign-in successful:", result.user.email);
    
    return result;
  } catch (error: any) {
    console.error("Error signing in with email link:", error);
    throw error;
  }
};

// Get auth state
const onUserChange = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);

// Sign out
const logout = async () => {
  // Clear authentication markers before signing out
  clearAuthMarkers();
  return signOut(auth);
};

// Send password reset email
const resetPassword = async (email: string) => {
  // Ensure Firebase is properly initialized
  if (!auth) {
    console.error("Firebase auth is not initialized");
    throw new Error("Authentication service is not available");
  }

  try {
    // Configure the action URL for password reset
    const actionCodeSettings = {
      // Redirect to login page after password reset
      url: typeof window !== 'undefined' ? 
        `${window.location.protocol}//${window.location.host}/login` : 
        'https://lakenine.vercel.app/login', // Fallback URL
      handleCodeInApp: false
    };
    
    console.log("Sending password reset to:", email);
    console.log("With redirect URL:", actionCodeSettings.url);
    
    // Make the auth call with proper settings
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    console.log("Password reset email sent successfully");
    return true;
  } catch (error: any) {
    console.error("Firebase password reset error:", error);
    
    // Enhance error details for better debugging
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    
    // Rethrow for the UI to handle
    throw error;
  }
};

// Verify Firebase authentication configuration
const verifyAuthConfig = async () => {
  if (typeof window === 'undefined') return;
  
  console.log("Verifying Firebase auth configuration...");
  console.log("Current origin:", window.location.origin);
  // Print public config info only
  console.log("Firebase Config:", {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId
  });
  
  // Print auth state safely
  console.log("Auth State:", {
    currentUser: auth.currentUser ? {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      emailVerified: auth.currentUser.emailVerified,
      isAnonymous: auth.currentUser.isAnonymous
    } : null
  });
};

// Sign in with Google using Popup (alternative to redirect for troubleshooting)
const signInWithGooglePopup = async () => {
  try {
    console.log("Starting Google sign-in with popup");
    
    // Configure provider
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      login_hint: localStorage.getItem('lastEmail') || '',
    });
    
    // Use popup method
    const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    console.log("Google popup sign-in successful:", result.user.email);
    
    // Store email for future hints
    if (result.user.email) {
      localStorage.setItem('lastEmail', result.user.email);
    }
    
    // Mark authentication as active for browser session tracking
    markAuthActive();
    
    return result;
  } catch (error: any) {
    console.error("Google popup sign-in error:", error);
    throw error;
  }
};

// Export all functions and objects
export {
  auth,
  app,
  db,
  googleProvider,
  registerWithEmailAndUsername,
  loginWithEmail,
  resolveEmailFromUsername,
  signInWithGoogle,
  signInWithGooglePopup,
  signUpWithGoogle,
  handleRedirectResult,
  sendLoginLink,
  checkIfEmailLink,
  loginWithEmailLink,
  onUserChange,
  logout,
  resetPassword,
  verifyAuthConfig,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  initializeBrowserSession,
  isNewBrowserSession,
  markAuthActive,
  clearAuthMarkers,
  setupPageUnloadDetection
};

export type { User };
 
