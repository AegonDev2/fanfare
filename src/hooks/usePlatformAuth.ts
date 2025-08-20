import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { useEffect, useState } from 'react';

export interface PlatformInfo {
  isNative: boolean;
  platform: string;
  isAndroid: boolean;
  isIOS: boolean;
  isWeb: boolean;
}

export const usePlatformAuth = () => {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    isNative: false,
    platform: 'web',
    isAndroid: false,
    isIOS: false,
    isWeb: true
  });

  useEffect(() => {
    const detectPlatform = async () => {
      const isNative = Capacitor.isNativePlatform();
      const platform = Capacitor.getPlatform();
      
      let isAndroid = false;
      let isIOS = false;
      
      if (isNative) {
        const deviceInfo = await Device.getInfo();
        isAndroid = deviceInfo.platform === 'android';
        isIOS = deviceInfo.platform === 'ios';
      }

      setPlatformInfo({
        isNative,
        platform,
        isAndroid,
        isIOS,
        isWeb: !isNative
      });

      console.log('Platform detection:', {
        isNative,
        platform,
        isAndroid,
        isIOS,
        isWeb: !isNative,
        userAgent: navigator.userAgent
      });
    };

    detectPlatform();
  }, []);

  const shouldUseNativeAuth = () => {
    return platformInfo.isNative && (platformInfo.isAndroid || platformInfo.isIOS);
  };

  const shouldUseWebAuth = () => {
    return platformInfo.isWeb || (!platformInfo.isAndroid && !platformInfo.isIOS);
  };

  return {
    ...platformInfo,
    shouldUseNativeAuth,
    shouldUseWebAuth
  };
};