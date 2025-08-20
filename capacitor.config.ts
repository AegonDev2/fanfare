
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
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    loggingBehavior: 'none'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: "#000000",
      showSpinner: false
    }
  }
};

export default config;
