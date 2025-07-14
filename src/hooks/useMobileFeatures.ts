import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
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
        // Create visual feedback
        const refreshIndicator = document.createElement('div');
        refreshIndicator.innerHTML = '↻ Refreshing...';
        refreshIndicator.style.cssText = `
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          padding: 8px 16px;
          border-radius: 8px;
          z-index: 9999;
          font-size: 14px;
        `;
        document.body.appendChild(refreshIndicator);
        
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [enablePullToRefresh]);

  return {
    showExitPrompt,
    dismissExitPrompt: () => {
      setShowExitPrompt(false);
      setBackPressCount(0);
    }
  };
};