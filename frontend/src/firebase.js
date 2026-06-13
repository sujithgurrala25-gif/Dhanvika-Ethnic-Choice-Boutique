import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAOMay1lG1JaxfmuaMp1xGDv3HFI2TXj5U",
  authDomain: "dhanvika-boutique-a8419.firebaseapp.com",
  projectId: "dhanvika-boutique-a8419",
  storageBucket: "dhanvika-boutique-a8419.firebasestorage.app",
  messagingSenderId: "603141891799",
  appId: "1:603141891799:web:df7eeff59ac66c000ff292",
  measurementId: "G-GW9QVBV8C5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
