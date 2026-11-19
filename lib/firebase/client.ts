'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  deleteDoc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  serverTimestamp,
  query,
  where,
  type Firestore,
} from 'firebase/firestore';
import { getFirebaseEnvFallback, type FirebaseClientConfig } from '@/lib/firebase/types';

export type { FirebaseClientConfig };

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;
let cachedAuth: Auth | null = null;
let cachedProvider: GoogleAuthProvider | null = null;

export function initFirebaseClient(config?: FirebaseClientConfig | null): {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
  googleAuthProvider: GoogleAuthProvider | null;
} {
  if (cachedApp && cachedDb && cachedAuth && cachedProvider) {
    return {
      app: cachedApp,
      db: cachedDb,
      auth: cachedAuth,
      googleAuthProvider: cachedProvider,
    };
  }

  const resolved = config?.apiKey && config?.projectId && config?.appId
    ? config
    : getFirebaseEnvFallback();

  if (!resolved) {
    return {
      app: null,
      db: null,
      auth: null,
      googleAuthProvider: null,
    };
  }

  const app = getApps().length ? getApps()[0] : initializeApp(resolved);
  const db = resolved.firestoreDatabaseId
    ? getFirestore(app, resolved.firestoreDatabaseId)
    : getFirestore(app);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  cachedApp = app;
  cachedDb = db;
  cachedAuth = auth;
  cachedProvider = provider;

  return { app, db, auth, googleAuthProvider: provider };
}

export function getFirebaseAuth(): Auth | null {
  return cachedAuth ?? initFirebaseClient().auth;
}

export function getFirebaseDb(): Firestore | null {
  return cachedDb ?? initFirebaseClient().db;
}

export function getGoogleAuthProvider(): GoogleAuthProvider | null {
  return cachedProvider ?? initFirebaseClient().googleAuthProvider;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const activeAuth = getFirebaseAuth();
  const currentUser = activeAuth?.currentUser ?? null;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let connectionTested = false;

export async function testFirestoreConnection(): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;
  if (connectionTested) return true;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

export async function syncUserProfileToFirestore(params: {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
}) {
  const db = getFirebaseDb();
  if (!db) return;
  const path = `users/${params.uid}/private/profile`;
  try {
    await setDoc(
      doc(db, 'users', params.uid, 'private', 'profile'),
      {
        userId: params.uid,
        fullName: params.fullName,
        email: params.email,
        phone: params.phone || '',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function toggleWishlistInFirestore(uid: string, productId: string, saved: boolean) {
  const db = getFirebaseDb();
  if (!db) return;
  const path = `users/${uid}/wishlist/${productId}`;
  try {
    if (saved) {
      await setDoc(doc(db, 'users', uid, 'wishlist', productId), {
        productId,
        createdAt: serverTimestamp(),
      });
    } else {
      await deleteDoc(doc(db, 'users', uid, 'wishlist', productId));
    }
  } catch (error) {
    handleFirestoreError(error, saved ? OperationType.WRITE : OperationType.DELETE, path);
  }
}

export async function fetchUserOrdersFromFirestore(uid: string) {
  const db = getFirebaseDb();
  if (!db) return [];
  const path = 'orders';
  try {
    const q = query(collection(db, path), where('userId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
