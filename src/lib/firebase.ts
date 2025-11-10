import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'studio-2244406487-aef62',
  appId: '1:522660406159:web:09fb418090af2f84a5a1fa',
  apiKey: 'AIzaSyCPEV6oHXAwOqvmuc-0vdRMeZ2OXQixJoI',
  authDomain: 'studio-2244406487-aef62.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '522660406159',
  storageBucket: 'studio-2244406487-aef62.appspot.com'
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

try {
    enableIndexedDbPersistence(db);
} catch (error: any) {
    if (error.code == 'failed-precondition') {
        console.warn('Firebase persistence failed. Multiple tabs open?');
    } else if (error.code == 'unimplemented') {
        console.warn('Firebase persistence not available in this browser.');
    }
}
