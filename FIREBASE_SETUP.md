# Firebase Setup for FanFare App

This app now uses Firebase for authentication instead of Supabase. Follow these steps to complete the setup:

## 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication and configure Google provider
4. Get your Firebase configuration from Project Settings

## 2. Update Firebase Configuration

Replace the configuration in `src/lib/firebase.ts` with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

## 3. Google Authentication Setup

### Web Setup
1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Google provider
3. Add your domain to authorized domains

### Android Setup
1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/` directory
3. Add the SHA-1 fingerprint of your debug keystore to Firebase Console

To get SHA-1 fingerprint:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

## 4. Capacitor Configuration

The app is already configured to work with Capacitor. After setting up Firebase:

1. Run `npx cap sync` to sync the configuration
2. For Android: `npx cap run android`
3. For iOS: `npx cap run ios`

## 5. Authentication Flow

- **Web**: Uses Firebase Auth with Google popup
- **Mobile**: Uses native Google Auth plugin with Firebase integration
- **User Data**: Stored in Firebase Auth, display name set during signup

## 6. Features

- ✅ Google Sign-in/Sign-up (Web & Mobile)
- ✅ Email/Password authentication
- ✅ User profile with display name
- ✅ Automatic navigation after auth
- ✅ Loading states and error handling

The app will automatically detect if running on mobile/web and use the appropriate authentication method.