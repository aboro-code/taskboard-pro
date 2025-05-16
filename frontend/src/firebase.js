import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAowmxGpjy5ooRYlhNmrmrim3rCSFN23BM",
  authDomain: "issuetracker-c37bd.firebaseapp.com",
  projectId: "issuetracker-c37bd",
  storageBucket: "issuetracker-c37bd.appspot.com",
  messagingSenderId: "203153310164",
  appId: "1:203153310164:web:5c51ce896a29c03ccd5641"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
