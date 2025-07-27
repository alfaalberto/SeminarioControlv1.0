


// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your project's Firebase credentials.
const firebaseConfig = {
  apiKey: "AIzaSyAm1rO83jKsILhEdj19oYDX_rhw7n4ayyk",
  authDomain: "seminarioevals-v-1-22d3b.firebaseapp.com",
  projectId: "seminarioevals-v-1-22d3b",
  storageBucket: "seminarioevals-v-1-22d3b.appspot.com",
  messagingSenderId: "682385997401",
  appId: "1:682385997401:web:e38b009298678e67ab3b48"
};


// Export the API key to be checked by the app
export const FIREBASE_API_KEY = firebaseConfig.apiKey;
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;


// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Persistence is now handled in AuthContext to better manage initialization errors.

export { auth, db, firebase };