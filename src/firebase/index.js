// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const {
  initializeAppCheck,
  ReCaptchaV3Provider,
} = require('firebase/app-check');
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC5ckCyFMUdhFsdg-13Hg9phtEHVnBAgnM',
  authDomain: 'draw-rush.firebaseapp.com',
  databaseURL:
    'https://draw-rush-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'draw-rush',
  storageBucket: 'draw-rush.appspot.com',
  messagingSenderId: '941454002806',
  appId: '1:941454002806:web:89bae0d8f1eb7b7fb76d57',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6Ldlt7QfAAAAANZUm1Erw1cNhrih77j5Zy7WyDuG'),
  isTokenAutoRefreshEnabled: true,
});

export const db = getDatabase(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
