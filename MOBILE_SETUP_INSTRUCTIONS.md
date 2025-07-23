// Add this to your android/app/src/main/AndroidManifest.xml
// Add this permission for Firebase Cloud Messaging
<uses-permission android:name="android.permission.WAKE_LOCK" />

// Add this service for FCM in the <application> tag
<service
    android:name="com.getcapacitor.plugin.pushnotifications.NotificationService"
    android:exported="false" />
    
// Also add this in your android/app/build.gradle dependencies
// implementation 'com.google.firebase:firebase-messaging:23.0.0'

// For iOS, add this to your ios/App/App/Info.plist
/*
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
*/