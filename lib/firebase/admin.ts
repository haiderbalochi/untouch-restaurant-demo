import {
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase, type Database } from "firebase-admin/database";

/**
 * Server-side Firebase Admin. Used for trusted operations only
 * (order creation, admin mutations, SEO lookups) against the
 * Firebase Realtime Database — the single application database.
 */

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export const DATABASE_URL =
  process.env.FIREBASE_ADMIN_DATABASE_URL ||
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  "https://untouch-returant-default-rtdb.firebaseio.com";

function readServiceAccount(): Record<string, string> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const json = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, string>;
  } catch {
    console.error("[firebase-admin] FIREBASE_SERVICE_ACCOUNT_JSON could not be parsed.");
    return null;
  }
}

export const ADMIN_READY = Boolean(
  readServiceAccount() ||
    (projectId && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY),
);

let app: App | null = null;
let db: Database | null = null;

function getAdminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApp();
    return app;
  }
  const serviceAccount = readServiceAccount();
  if (serviceAccount) {
    app = initializeApp({
      credential: cert(serviceAccount as never),
      projectId: serviceAccount.project_id ?? projectId,
      databaseURL: DATABASE_URL,
    });
  } else if (projectId && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      databaseURL: DATABASE_URL,
    });
  } else {
    // Works inside Google Cloud / emulator environments where ADC is available.
    app = initializeApp({ credential: applicationDefault(), projectId, databaseURL: DATABASE_URL });
  }
  return app;
}

export function getAdminDb(): Database {
  if (!ADMIN_READY) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY (or FIREBASE_SERVICE_ACCOUNT_JSON).",
    );
  }
  if (!db) {
    // The Realtime Database URL is bound when the admin app is initialised.
    db = getDatabase(getAdminApp());
  }
  return db;
}

export function getAdminAuth() {
  if (!ADMIN_READY) {
    throw new Error("Firebase Admin is not configured — cannot verify sessions.");
  }
  return getAuth(getAdminApp());
}
