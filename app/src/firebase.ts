import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

// Replace these placeholder values with your actual Firebase project config
// Firebase Console → Project Settings → Your apps → SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHvNzkdOReX4NHFIFHv-sYe5h2sU8qEso",
  authDomain: "hoosier-prints.firebaseapp.com",
  projectId: "hoosier-prints",
  storageBucket: "hoosier-prints.firebasestorage.app",
  messagingSenderId: "599587410620",
  appId: "1:599587410620:web:326da6089b0cdab5ed36b9",
  measurementId: "G-N2JC34YKCD"
};

const app = initializeApp(firebaseConfig)
export const analytics = getAnalytics(app)
