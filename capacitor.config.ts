
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a407041e65d3402da5484a08462e8022',
  appName: 'giftloop-connect',
  webDir: 'dist',
  server: {
    url: 'https://a407041e-65d3-402d-a548-4a08462e8022.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false,
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
