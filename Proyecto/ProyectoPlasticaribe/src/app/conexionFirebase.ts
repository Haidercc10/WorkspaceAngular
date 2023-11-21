import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAaIM3smKthn_FGmznnvCPm-tekjivdixI",
  authDomain: "mails-79f3c.firebaseapp.com",
  projectId: "mails-79f3c",
  storageBucket: "mails-79f3c.appspot.com",
  messagingSenderId: "302022308015",
  appId: "1:302022308015:web:b99c38e9e950bd0176245a",
  measurementId: "G-29DBEX6PHQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
