
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AuthModal from '@/components/AuthModal';
import { auth, googleProvider, db } from '@/lib/firebase'; // Import db
import { 
  User,
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  type AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, Timestamp } from "firebase/firestore"; // Firestore imports
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { WelcomePopup } from '@/components/WelcomePopup';

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  loginUser: (email: string, pass: string) => Promise<void>;
  registerUser: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  showAuthModal: boolean;
  openAuthModal: (initialView?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalView: 'login' | 'register';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const [welcomeUser, setWelcomeUser] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        if (userDoc.exists() && (userData?.accountStatus === 'suspended' || userData?.accountStatus === 'deactivated')) {
          setCurrentUser(null);
          setIsLoggedIn(false);
          setIsAdmin(false);
          await firebaseSignOut(auth);
        } else {
          // Check for admin status from Firestore document
          const currentIsAdmin = userData?.isAdmin === true;
          
          setCurrentUser(user);
          setIsLoggedIn(true);
          setIsAdmin(currentIsAdmin);
          
          if (currentIsAdmin && !pathname.startsWith('/admin')) {
            router.push('/admin');
          }
        }
      } else {
        if (user && !user.emailVerified) {
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [pathname, router]);

  const checkUserStatus = async (user: User): Promise<boolean> => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists() && (userDoc.data().accountStatus === 'suspended' || userDoc.data().accountStatus === 'deactivated')) {
      await firebaseSignOut(auth);
      toast({ title: 'Login Failed', description: `Your account has been ${userDoc.data().accountStatus}.`, variant: 'destructive' });
      return false;
    }
    return true;
  }

  const handleSuccessfulLogin = (user: User) => {
    closeAuthModal();
    setWelcomeUser(user.displayName || 'User');
    const userDocRef = doc(db, "users", user.uid);
    getDoc(userDocRef).then(userDoc => {
      if (userDoc.exists() && userDoc.data().isAdmin === true) {
        router.push('/admin');
      }
    });
  };

  const loginUser = async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await firebaseSignOut(auth);
        toast({
          title: 'Verification Required',
          description: 'Please check your inbox and verify your email address before logging in.',
          variant: 'destructive',
          duration: 9000
        });
        throw new Error('Email not verified');
      }
      
      const isUserActive = await checkUserStatus(user);
      if (!isUserActive) {
          throw new Error('Account not active');
      }

      handleSuccessfulLogin(user);

    } catch (error) {
       if ((error as Error).message === 'Email not verified' || (error as Error).message === 'Account not active') {
        return;
      }

      const authError = error as AuthError;
      console.error("Firebase login error:", authError.code, authError.message);
      
      let description = "An unknown error occurred. Please try again.";
      switch (authError.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          description = "Incorrect email or password. Please check your credentials and try again.";
          break;
        case 'auth/user-disabled':
          description = "This user account has been disabled by an administrator.";
          break;
        case 'auth/too-many-requests':
          description = "Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.";
          break;
        case 'auth/operation-not-allowed':
          description = "Email/Password sign-in is not enabled for this app. Please contact support.";
          break;
        default:
          description = authError.message || description;
          break;
      }

      toast({ title: 'Login Failed', description, variant: 'destructive' });
      throw authError;
    }
  };

  const registerUser = async (email: string, pass: string, name?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      if (user) {
        await sendEmailVerification(user);

        if (name) {
          await updateProfile(user, { displayName: name });
        }
        const userDocRef = doc(db, "users", user.uid);
        try {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: name || user.displayName || "Anonymous User",
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp(),
            provider: "email/password",
            accountStatus: "active",
            isAdmin: false, // Default to not being an admin
          });
        } catch (firestoreError) {
          console.error(`AuthContext: Firestore error creating document for user ${user.uid}:`, firestoreError);
          toast({ title: 'Account Partially Created', description: 'Authentication successful, but failed to save user profile data. Please contact support.', variant: 'destructive' });
        }
      }
      toast({
        title: 'Registration Successful!',
        description: 'A verification link has been sent to your email. Please verify your account before logging in.',
        duration: 9000
      });
      closeAuthModal();
      await firebaseSignOut(auth);
    } catch (error) {
      const authError = error as AuthError;
      console.error("AuthContext: Firebase registration error:", authError.code, authError.message);
      toast({ title: 'Registration Failed', description: authError.message || 'Could not register.', variant: 'destructive' });
      throw authError;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      
      try {
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "Google User",
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp(),
            provider: "google.com", 
            accountStatus: 'active',
            isAdmin: false, // Default to not being an admin
          });
        } else {
          if (userDocSnap.data().accountStatus === 'suspended' || userDocSnap.data().accountStatus === 'deactivated') {
              await firebaseSignOut(auth);
              toast({ title: 'Login Failed', description: `Your account has been ${userDocSnap.data().accountStatus}.`, variant: 'destructive' });
              return;
          }
          await updateDoc(userDocRef, {
              displayName: user.displayName || userDocSnap.data()?.displayName || "Google User",
              photoURL: user.photoURL || userDocSnap.data()?.photoURL || null,
              lastLoginAt: serverTimestamp() 
          });
        }
        handleSuccessfulLogin(user);
      } catch (firestoreError) {
        console.error(`AuthContext: Firestore error creating/updating document for Google user ${user.uid}:`, firestoreError);
        toast({ title: 'Sign-In Partially Successful', description: 'Authentication successful, but failed to save/update user profile data. Some features might be limited.', variant: 'destructive' });
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error("AuthContext: Firebase Google sign-in error object:", authError);
      let description = 'Could not sign in with Google. Please try again.';
      if (authError.code === 'auth/unauthorized-domain') {
        description = 'This domain is not authorized for Google Sign-In. Please check Firebase console > Authentication > Settings > Authorized domains, and also Google Cloud Console API Key restrictions for HTTP referrers.';
      } else if (authError.code === 'auth/operation-not-allowed') {
        description = 'Google Sign-In is not enabled for this project. Please enable it in Firebase console > Authentication > Sign-in method.';
      } else if (authError.code === 'auth/popup-blocked') {
        description = 'Google Sign-In popup was blocked by your browser. Please disable your popup blocker for this site and try again.';
      } else if (authError.code === 'auth/cancelled-popup-request' || authError.code === 'auth/popup-closed-by-user') {
        description = 'Google Sign-In was cancelled or the popup was closed before completion.';
      } else if (authError.code === 'auth/account-exists-with-different-credential') {
        description = 'An account already exists with this email address using a different sign-in method. Please sign in with your original method.';
      } else if (authError.message) {
        description = authError.message;
      }
      toast({ title: 'Google Sign-In Failed', description: `Details: ${authError.code}. ${description}`, variant: 'destructive' });
      throw authError; 
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      if (pathname.startsWith('/admin') || pathname.startsWith('/my-account')) {
        router.push('/');
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error("AuthContext: Firebase logout error:", authError.code, authError.message);
      toast({ title: 'Logout Failed', description: authError.message || 'Could not log out.', variant: 'destructive' });
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
        toast({ title: 'Password Reset Email Sent', description: 'Please check your inbox for a link to reset your password.' });
    } catch (error) {
        const authError = error as AuthError;
        let description = 'An unknown error occurred. Please try again.';
        if (authError.code === 'auth/user-not-found') {
            description = 'No user found with this email address.';
        }
        toast({ title: 'Password Reset Failed', description, variant: 'destructive'});
        throw authError;
    }
  };

  const openAuthModal = (initialView: 'login' | 'register' = 'login') => {
    setAuthModalView(initialView);
    setShowAuthModal(true);
  };
  const closeAuthModal = () => setShowAuthModal(false);

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoggedIn, 
      isAdmin,
      loading,
      loginUser, 
      registerUser, 
      signInWithGoogle,
      logout, 
      sendPasswordReset,
      showAuthModal, 
      openAuthModal, 
      closeAuthModal, 
      authModalView 
    }}>
      {!loading && children}
      {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} initialView={authModalView} />}
      {welcomeUser && (
        <WelcomePopup 
          userName={welcomeUser} 
          onClose={() => setWelcomeUser(null)} 
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
