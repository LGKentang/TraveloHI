// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDrWi_t1pzaKkjtg9AjTrVYwq3f2LNZiMI",
  authDomain: "tpa-web-76f17.firebaseapp.com",
  projectId: "tpa-web-76f17",
  storageBucket: "tpa-web-76f17.appspot.com",
  messagingSenderId: "725273138881",
  appId: "1:725273138881:web:c7de3c5c8839c9f014e640",
  measurementId: "G-BMZEYWJ8WL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);
