import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

export const getPlatformInfo = async () => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  
  let isAndroid = false;
  let isIOS = false;
  
  if (isNative) {
    try {
      const deviceInfo = await Device.getInfo();
      isAndroid = deviceInfo.platform === 'android';
      isIOS = deviceInfo.platform === 'ios';
    } catch (error) {
      console.warn('Could not get device info:', error);
    }
  }

  const platformInfo = {
    isNative,
    platform,
    isAndroid,
    isIOS,
    isWeb: !isNative
  };

  console.log('📱 Platform Info:', {
    ...platformInfo,
    userAgent: navigator.userAgent
  });

  return platformInfo;
};

export const shouldUseNativeAuth = async () => {
  const { isNative, isAndroid, isIOS } = await getPlatformInfo();
  return isNative && (isAndroid || isIOS);
};

export const shouldUseWebAuth = async () => {
  const { isWeb, isAndroid, isIOS } = await getPlatformInfo();
  return isWeb || (!isAndroid && !isIOS);
};