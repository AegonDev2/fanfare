# Push Notification Setup for Android

## Issue Fixed
The app was crashing during Android Studio build because the Capacitor Push Notifications plugin was not properly configured.

## What was missing:
1. **capacitor-push-notifications** plugin missing from Android build configuration
2. **Firebase Cloud Messaging dependencies** not included
3. **Required permissions and FCM service** missing from AndroidManifest.xml
4. **google-services.json** file missing (required for Firebase)

## Fixed:
✅ Added `capacitor-push-notifications` to `capacitor.build.gradle` and `capacitor.settings.gradle`
✅ Added Firebase Messaging dependency (`firebase-messaging:23.0.0`)
✅ Added required permissions (`WAKE_LOCK`) to AndroidManifest.xml
✅ Added FCM notification service to AndroidManifest.xml

## Still needed for production:
⚠️ **IMPORTANT**: You still need to add a `google-services.json` file to `android/app/` directory

### How to get google-services.json:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Add Android app to your project
4. Use package name: `com.fanfare.app`
5. Download the `google-services.json` file
6. Place it in `android/app/google-services.json`

### After adding google-services.json:
```bash
npx cap sync android
npx cap run android
```

## Testing:
- The app should now build successfully in Android Studio
- Push notifications will work once firebase is properly configured
- FCM tokens will be generated and stored in your database