import fs from 'node:fs';
import path from 'node:path';
import { getFirebaseEnvFallback, type FirebaseClientConfig } from '@/lib/firebase/types';

export function getFirebaseClientConfig(): FirebaseClientConfig | null {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');

  try {
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<FirebaseClientConfig>;
      if (parsed.apiKey && parsed.projectId && parsed.appId) {
        return {
          projectId: parsed.projectId,
          appId: parsed.appId,
          apiKey: parsed.apiKey,
          authDomain: parsed.authDomain || `${parsed.projectId}.firebaseapp.com`,
          firestoreDatabaseId: parsed.firestoreDatabaseId || undefined,
          storageBucket: parsed.storageBucket || undefined,
          messagingSenderId: parsed.messagingSenderId || undefined,
          measurementId: parsed.measurementId || undefined,
        };
      }
    }
  } catch {
    // Fall back to environment variables if local config JSON is unavailable or unreadable
  }

  return getFirebaseEnvFallback();
}
