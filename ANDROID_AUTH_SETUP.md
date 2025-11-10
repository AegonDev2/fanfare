# Android Email Authentication Deep Link Setup

## Problem
Email authentication links were redirecting to the web browser instead of opening in the Android app.

## Solution
Implemented deep linking with custom scheme `fanfare://` to ensure email verification links open directly in the Android app.

## What Was Changed

### 1. Android Manifest (`android/app/src/main/AndroidManifest.xml`)
Added intent filters to handle deep links:
- Custom scheme: `fanfare://auth/callback`
- HTTPS fallback: `https://your-domain.com/auth/callback`

### 2. Capacitor Configuration (`capacitor.config.ts`)
Added deep link scheme configuration for Android and iOS.

### 3. Deep Link Handler (`src/utils/deepLinkHandler.ts`)
Created utility to:
- Detect if running in native app
- Generate correct redirect URL for each platform
- Handle incoming deep links

### 4. Auth Components
Updated `SignUpForm.tsx` and `AuthCallback.tsx` to:
- Use platform-appropriate redirect URLs
- Parse and handle deep link authentication tokens
- Listen for app URL open events in native apps

## Required Steps for User

### Step 1: Add Redirect URL to Supabase
1. Go to your Supabase project dashboard
2. Navigate to **Authentication > URL Configuration**
3. Add these Redirect URLs:
   - `fanfare://auth/callback` (for Android app)
   - `https://a407041e-65d3-402d-a548-4a08462e8022.lovableproject.com/auth/callback` (for web)
4. Click **Save**

### Step 2: Sync Native App
After pulling the latest code:
```bash
# Install dependencies
npm install

# Sync changes to Android
npx cap sync android
```

### Step 3: Test the Flow
1. Build and run the app: `npx cap run android`
2. Sign up with a new email
3. Check your email inbox
4. Click the verification link
5. The app should open automatically and complete authentication

## How It Works

### Web Flow
1. User signs up → redirect to `https://your-domain.com/auth/callback`
2. Browser handles the redirect
3. Auth tokens extracted from URL hash
4. User logged in

### Android Flow
1. User signs up → redirect to `fanfare://auth/callback`
2. Android OS detects custom scheme
3. Opens Fanfare app (if installed)
4. Deep link handler extracts tokens from URL
5. `setSession()` called with tokens
6. User logged in in the app

## Troubleshooting

### Link Still Opens in Browser
- Ensure you've run `npx cap sync android`
- Verify the intent filters are in AndroidManifest.xml
- Check that redirect URL is added in Supabase dashboard
- Try uninstalling and reinstalling the app

### App Opens But Login Fails
- Check browser console for error logs
- Verify tokens are being extracted correctly
- Ensure Supabase is accepting the custom scheme

### Deep Link Not Detected
- Check Capacitor.isNativePlatform() returns true
- Verify App plugin is installed: `@capacitor/app`
- Check Android logs: `adb logcat | grep fanfare`

## Alternative: Universal Links (HTTPS)

If you have a custom domain, you can use Universal Links instead of custom schemes:

1. Add to AndroidManifest.xml:
```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https"
          android:host="yourdomain.com"
          android:pathPrefix="/auth/callback" />
</intent-filter>
```

2. Host `.well-known/assetlinks.json` on your domain
3. Update redirect URL in code to use HTTPS

Universal Links are more seamless but require domain ownership and DNS configuration.
