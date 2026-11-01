import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const defaultFirebaseConfig = {
  projectId: 'clear-bruin-1hl8x',
  appId: '1:937099412606:web:b07a5ac074d559e87ec42f',
  apiKey: 'AIzaSyCPZkjZt63rd-d5JA_y-kr1TXzvkxlsDhk',
  authDomain: 'clear-bruin-1hl8x.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-srtuniversalscho-2b2e4538-717e-4547-9b0c-34b5459682ed',
  storageBucket: 'clear-bruin-1hl8x.firebasestorage.app',
  messagingSenderId: '937099412606',
  measurementId: '',
  oAuthClientId: '937099412606-m369qqnhnih7k2kkdgq5ebm9o9uedufc.apps.googleusercontent.com',
  recaptchaSiteKey: '',
};

export const CUSTOM_FIREBASE_CONFIG_STORAGE_KEY = 'srt_custom_firebase_config_v1';

export type FirebaseClientConfigShape = typeof defaultFirebaseConfig;

function resolveFirebaseClientConfig(): FirebaseClientConfigShape {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(CUSTOM_FIREBASE_CONFIG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FirebaseClientConfigShape>;
        if (parsed.projectId && parsed.apiKey) {
          return {
            ...defaultFirebaseConfig,
            ...parsed,
          };
        }
      }
    } catch {
      // Fallback to default provisioned config
    }
  }
  return defaultFirebaseConfig;
}

export const firebaseClientConfig = resolveFirebaseClientConfig();
const app = initializeApp(firebaseClientConfig);
export const db = getFirestore(
  app,
  firebaseClientConfig.firestoreDatabaseId || '(default)'
);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
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

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();
