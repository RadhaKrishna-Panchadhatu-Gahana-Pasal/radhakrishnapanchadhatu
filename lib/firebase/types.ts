export interface FirebaseClientConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain?: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
}

export function getFirebaseEnvFallback(): FirebaseClientConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || '';
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || '';
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() || '';

  if (!apiKey || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    projectId,
    appId,
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ||
      `${projectId}.firebaseapp.com`,
    firestoreDatabaseId:
      process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID?.trim() || undefined,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || undefined,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || undefined,
    measurementId:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim() || undefined,
  };
}
