"use client";

// Import the underlying @firebase/app entrypoint directly. Mixing the
// `firebase/app` re-export with the @firebase/app instance used internally by
// @firebase/database/@firebase/auth lets a production bundle create two app
// registries, producing "Service database is not available". One entrypoint
// guarantees one registry.
import { getApps, initializeApp, type FirebaseApp } from "@firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase, type Database } from "firebase/database";

/**
 * UNTOUCH uses exactly two Firebase products on the client:
 *  • Firebase Authentication — identity only.
 *  • Firebase Realtime Database  — the single application database.
 * No other database client exists in this project.
 */

const DATABASE_URL =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  "https://untouch-returant-default-rtdb.firebaseio.com";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: DATABASE_URL,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const FIREBASE_READY = Boolean(config.apiKey && config.projectId && config.authDomain);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Database | null = null;
let authEmulatorWired = false;
let databaseEmulatorWired = false;

export function getFirebaseApp(): FirebaseApp | null {
  if (!FIREBASE_READY) return null;
  if (!app) {
    app = getApps()[0] ?? initializeApp(config);
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const instance = getFirebaseApp();
  if (!instance) return null;
  if (!authInstance) {
    authInstance = getAuth(instance);
    const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST;
    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" && emulatorHost && !authEmulatorWired) {
      authEmulatorWired = true;
      try {
        connectAuthEmulator(authInstance, `http://${emulatorHost}`, { disableWarnings: true });
      } catch {
        /* already connected */
      }
    }
  }
  return authInstance;
}

/** The one and only application database: Firebase Realtime Database. */
export function getDb(): Database | null {
  const instance = getFirebaseApp();
  if (!instance) return null;
  if (!dbInstance) {
    dbInstance = getDatabase(instance);
    const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST;
    if (
      process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" &&
      emulatorHost &&
      !databaseEmulatorWired
    ) {
      databaseEmulatorWired = true;
      try {
        const [host, port] = emulatorHost.split(":");
        connectDatabaseEmulator(dbInstance, host ?? "127.0.0.1", Number(port ?? 9000));
      } catch {
        /* already connected */
      }
    }
  }
  return dbInstance;
}

export function assertDb(): Database {
  const database = getDb();
  if (!database) {
    throw new Error(
      "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* variables to .env.local (see .env.example).",
    );
  }
  return database;
}
