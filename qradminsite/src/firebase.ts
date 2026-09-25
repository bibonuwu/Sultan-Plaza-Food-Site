import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { firebaseConfig } from './config';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

function createFirestore(): Firestore {
  try {
    // Локальный кэш: мгновенный старт и просмотр заказов при кратковременной потере сети
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    return initializeFirestore(app, { localCache: memoryLocalCache() });
  }
}

export const db = createFirestore();
