import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCSdx3hoUKiBVOx2EdCVZrA67TYZyJn66U",
  authDomain: "esp32-1ac47.firebaseapp.com",
  projectId: "esp32-1ac47",
  storageBucket: "esp32-1ac47.firebasestorage.app",
  messagingSenderId: "492166753666",
  appId: "1:492166753666:web:134fcc5a2dc58ed901739b",
  measurementId: "G-37VK0LTF1K"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

