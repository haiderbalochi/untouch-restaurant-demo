"use client";

import { FirebaseError } from "firebase/app";

const MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "An account already exists with this email. Try signing in instead.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/weak-password": "Choose a stronger password — at least 8 characters.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Please wait a minute and try again.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/cancelled-popup-request": "Google sign-in was cancelled.",
  "auth/popup-blocked": "Your browser blocked the Google popup. Allow popups and try again.",
  "auth/account-exists-with-different-credential":
    "This email already uses a different sign-in method. Use email and password instead.",
  "auth/network-request-failed": "Network problem — check your connection and try again.",
  "auth/operation-not-allowed":
    "This sign-in method is disabled in Firebase. Enable it in Firebase Console → Authentication → Sign-in method.",
  "auth/requires-recent-login": "Please sign in again to continue with this change.",
};

export function authErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    return MESSAGES[error.code] ?? "Something went wrong. Please try again.";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
