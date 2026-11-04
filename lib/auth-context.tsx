"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateAuthProfile,
  type User,
} from "firebase/auth";
import { FIREBASE_READY, getFirebaseAuth } from "@/lib/firebase/client";
import { ensureProfile, subscribeProfile, updateProfileFields } from "@/lib/data/user";
import type { UserProfile } from "@/lib/types";

interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  saveProfile: (patch: { displayName?: string; phone?: string; photoURL?: string; notificationPrefs?: UserProfile["notificationPrefs"] }) => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  refreshClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const syncedUid = useRef<string | null>(null);

  useEffect(() => {
    if (!FIREBASE_READY) {
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      try {
        const token = await nextUser.getIdTokenResult();
        setIsAdmin(token.claims.admin === true);
      } catch {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Keep the Realtime Database profile in sync with the auth session.
  useEffect(() => {
    if (!user) {
      setProfile(null);
      syncedUid.current = null;
      return;
    }
    if (syncedUid.current !== user.uid) {
      syncedUid.current = user.uid;
      ensureProfile({
        uid: user.uid,
        email: user.email ?? "",
        displayName: user.displayName ?? "",
        photoURL: user.photoURL ?? "",
      }).catch(() => {
        /* rules or network — profile snapshot below still reflects truth */
      });
    }
    const unsubscribe = subscribeProfile(
      user.uid,
      (next) => setProfile(next),
      () => setProfile(null),
    );
    return () => unsubscribe();
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured yet.");
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(async ({ email, password, fullName, phone }: SignUpInput) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured yet.");
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateAuthProfile(credential.user, { displayName: fullName.trim() });
    await ensureProfile({
      uid: credential.user.uid,
      email: email.trim(),
      displayName: fullName.trim(),
      photoURL: "",
    });
    if (phone) {
      await updateProfileFields(credential.user.uid, { phone });
    }
    await credential.user.getIdToken(true);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured yet.");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const credential = await signInWithPopup(auth, provider);
    await ensureProfile({
      uid: credential.user.uid,
      email: credential.user.email ?? "",
      displayName: credential.user.displayName ?? "",
      photoURL: credential.user.photoURL ?? "",
    });
  }, []);

  const signOutUser = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signOut(auth);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured yet.");
    await sendPasswordResetEmail(auth, email.trim(), {
      url: `${window.location.origin}/login`,
    });
  }, []);

  const saveProfile = useCallback(
    async (patch: {
      displayName?: string;
      phone?: string;
      photoURL?: string;
      notificationPrefs?: UserProfile["notificationPrefs"];
    }) => {
      if (!user) throw new Error("Sign in to update your profile.");
      await updateProfileFields(user.uid, patch);
      if (patch.displayName || patch.photoURL) {
        await updateAuthProfile(user, {
          displayName: patch.displayName ?? user.displayName,
          photoURL: patch.photoURL ?? user.photoURL,
        });
      }
    },
    [user],
  );

  const getIdToken = useCallback(
    async (forceRefresh = false) => {
      if (!user) return null;
      return user.getIdToken(forceRefresh);
    },
    [user],
  );

  const refreshClaims = useCallback(async () => {
    if (!user) return;
    const token = await user.getIdTokenResult(true);
    setIsAdmin(token.claims.admin === true);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isAdmin,
      loading,
      configured: FIREBASE_READY,
      signIn,
      signUp,
      signInWithGoogle,
      signOutUser,
      resetPassword,
      saveProfile,
      getIdToken,
      refreshClaims,
    }),
    [
      user,
      profile,
      isAdmin,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOutUser,
      resetPassword,
      saveProfile,
      getIdToken,
      refreshClaims,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>.");
  return context;
}
