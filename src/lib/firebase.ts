import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBNYxQw1c5J8KhFhRVKxQ2CZs0uF9gYwXs",
  authDomain: "fanfare-app-12345.firebaseapp.com",
  projectId: "fanfare-app-12345",
  storageBucket: "fanfare-app-12345.appspot.com",
  messagingSenderId: "551635583332",
  appId: "1:551635583332:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export default app;