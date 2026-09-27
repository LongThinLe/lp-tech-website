import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDSq0qX5N9VT4imcpMDYsi8BGwR-ISpDeI",
  authDomain: "webbanvattu.firebaseapp.com",
  projectId: "webbanvattu",
  storageBucket: "webbanvattu.firebasestorage.app",
  messagingSenderId: "810659691707",
  appId: "1:810659691707:web:53d20714390d7dedb2bd9e",
  measurementId: "G-2PN0TFBZKM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics, db, auth };