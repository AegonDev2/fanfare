
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fanfare.app',
  appName: 'giftloop-connect',
  webDir: 'dist',
  server: {
    url: 'https://a407041e-65d3-402d-a548-4a08462e8022.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false,
  android: {
    webContentsDebuggingEnabled: false,
    // Performance optimizations for Android
    allowMixedContent: true,
    captureInput: true,
    hideLogs: true,
    // Enable hardware acceleration
    hardwareAccelerated: true,
    // Optimize WebView performance
    loggingBehavior: 'none'
  },
  ios: {
    // Performance optimizations for iOS
    webContentsDebuggingEnabled: false,
    scheme: 'fanfare'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#1a1a1a",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    App: {
      launchUrl: ""
    }
  }
};

export default config;
