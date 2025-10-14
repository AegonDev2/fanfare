import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseMobileFeaturesOptions {
  enablePullToRefresh?: boolean;
  enableBackButton?: boolean;
}

export const useMobileFeatures = (options: UseMobileFeaturesOptions = {}) => {
  const { enablePullToRefresh = true, enableBackButton = true } = options;
  const navigate = useNavigate();
  const location = useLocation();
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [backPressCount, setBackPressCount] = useState(0);
  const [isAndroid, setIsAndroid] = useState(false);

  // Detect Android platform
  useEffect(() => {
    const checkPlatform = async () => {
      if (Capacitor.isNativePlatform()) {
        const info = await Device.getInfo();
        setIsAndroid(info.platform === 'android');
      }
    };
    checkPlatform();
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !enableBackButton) return;

    let backButtonListener: any;

    const setupBackButton = async () => {
      backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
        // If we can go back in browser history, do that
        if (canGoBack || window.history.length > 1) {
          navigate(-1);
          return;
        }

        // If we're at root and no history, show exit prompt
        if (location.pathname === '/' || !canGoBack) {
          if (showExitPrompt || backPressCount > 0) {
            // Close app if prompt is showing or second back press
            App.exitApp();
          } else {
            setShowExitPrompt(true);
            setBackPressCount(1);
            
            // Hide prompt after 3 seconds
            setTimeout(() => {
              setShowExitPrompt(false);
              setBackPressCount(0);
            }, 3000);
          }
        }
      });
    };

    setupBackButton();

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [enableBackButton, navigate, location.pathname, showExitPrompt, backPressCount]);

  // Pull to refresh functionality
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !enablePullToRefresh) return;

    let startY = 0;
    let isRefreshing = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshing) return;
      
      const currentY = e.touches[0].clientY;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Only trigger if at top of page and pulling down
      if (scrollTop === 0 && currentY > startY + 100) {
        isRefreshing = true;
        
        // Dispatch custom event for React Query to handle
        window.dispatchEvent(new CustomEvent('mobile-pull-refresh'));
        
        // Reset refreshing state after a short delay
        setTimeout(() => {
          isRefreshing = false;
        }, 2000);
      }
    };

    const handleTouchEnd = () => {
      // Reset on touch end
      setTimeout(() => {
        isRefreshing = false;
      }, 1000);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enablePullToRefresh]);

  return {
    showExitPrompt,
    isAndroid,
    dismissExitPrompt: () => {
      setShowExitPrompt(false);
      setBackPressCount(0);
    }
  };
};