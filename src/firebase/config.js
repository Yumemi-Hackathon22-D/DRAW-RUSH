// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/database';
import 'firebase/compat/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAUmvYTBz6HsXSgIUSktSDdz8lHvxAOjz0',
  authDomain: 'draw-rush.firebaseapp.com',
  projectId: 'draw-rush',
  storageBucket: 'draw-rush.appspot.com',
  messagingSenderId: '941454002806',
  appId: '1:941454002806:web:89bae0d8f1eb7b7fb76d57',
};

firebase.initializeApp(firebaseConfig);
// Initialize Firebase

export const db = firebase.firestore();
