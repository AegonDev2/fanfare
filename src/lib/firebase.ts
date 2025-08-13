import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCSRB5fWPZ4mrIzFnmltZULaKm5MRH1nyg",
  authDomain: "fanfare-5b5ab.firebaseapp.com",
  projectId: "fanfare-5b5ab",
  storageBucket: "fanfare-5b5ab.appspot.com",
  messagingSenderId: "781420238033",
  appId: "1:781420238033:android:9d5b1144435f60cc4561f0",
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