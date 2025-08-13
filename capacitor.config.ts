
import { CapacitorConfig } from '@capacitor/cli';

// If CAP_SERVER_URL is provided, use it (useful for remote dev). Otherwise load local assets from webDir.
const devServerUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'app.lovable.a407041e65d3402da5484a08462e8022',
  appName: 'giftloop-connect',
  webDir: 'dist',
  ...(devServerUrl
    ? { server: { url: devServerUrl, cleartext: true } }
    : {}),
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
