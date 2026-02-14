// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjrcg93desb0mCLBld2kHrAkPHAYd-GEU",
  authDomain: "pollux-422812.firebaseapp.com",
  databaseURL: "https://pollux-422812-default-rtdb.firebaseio.com",
  projectId: "pollux-422812",
  storageBucket: "pollux-422812.appspot.com",
  messagingSenderId: "1009511995969",
  appId: "1:1009511995969:web:24881983281b72e86e04c0",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
