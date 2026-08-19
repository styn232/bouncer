import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app: any = null;
let authInstance: any = null;
let dbInstance: any = null;

try {
  if (typeof window !== 'undefined') {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    if (app) {
      try {
        authInstance = getAuth(app);
      } catch (authErr) {
        console.warn('Firebase Auth initialization note:', authErr);
      }
      try {
        dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
      } catch (dbErr) {
        console.warn('Firebase Firestore initialization note:', dbErr);
      }
    }
  }
} catch (e) {
  console.warn('Firebase initialization note:', e);
}

export const auth = authInstance;
export const db = dbInstance;

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where
};

export type { FirebaseUser };
