'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Gift, Heart, Star, Sparkles } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface TextShimmerProps {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}

function TextShimmer({
  children,
  as: Component = 'p',
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  return React.createElement(
    motion[Component as keyof typeof motion] as any,
    {
      className: `relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent [--base-color:#a1a1aa] [--base-gradient-color:#000] [--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box] dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff] dark:[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] ${className}`,
      initial: { backgroundPosition: '100% center' },
      animate: { backgroundPosition: '0% center' },
      transition: {
        repeat: Infinity,
        duration,
        ease: 'linear',
      },
      style: {
        '--spread': `${dynamicSpread}px`,
        backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
      } as React.CSSProperties,
    },
    children
  );
}

interface GradientBarsProps {
  bars?: number;
  colors?: string[];
}

function GradientBars({
  bars = 20,
  colors = ['#e60a64', 'transparent'],
}: GradientBarsProps) {
  const gradientStyle = `linear-gradient(to top, ${colors.join(', ')})`;
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="flex h-full w-full">
        {Array.from({ length: bars }).map((_, index) => {
          const position = index / (bars - 1);
          const center = 0.5;
          const distance = Math.abs(position - center);
          const scale = 0.3 + 0.7 * Math.pow(distance * 2, 1.2);

          return (
            <motion.div
              key={`bg-bar-${index}`}
              className="flex-1 origin-bottom"
              style={{ background: gradientStyle }}
              animate={{
                scaleY: [scale, scale + 0.1, scale],
                opacity: [1, 0.95, 1],
              }}
              transition={{
                duration: 3,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'mirror',
                delay: index * 0.5,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function FloatingIcon({ icon: Icon, delay = 0, className = "" }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        y: [0, -100, -200],
        x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeOut"
      }}
    >
      <Icon className="w-6 h-6 text-pink-400" />
    </motion.div>
  );
}

function PulsingOrb({ size = "w-32 h-32", color = "bg-gradient-to-r from-pink-500 to-purple-600", delay = 0 }) {
  return (
    <motion.div
      className={`${size} ${color} rounded-full absolute blur-xl opacity-60`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.6, 0.8, 0.6],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  );
}

export const AppInitializingSkeleton = () => {
  const [loadingText, setLoadingText] = useState("Preparing your gifts");
  const [progress, setProgress] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  const loadingMessages = [
    "Preparing your gifts",
    "Connecting to creators",
    "Spreading the love",
    "Almost ready"
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setShowComplete(true);
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const textInterval = setInterval(() => {
      setLoadingText(prev => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, []);

  if (showComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        <GradientBars colors={['#ec4899', 'transparent']} />
        
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="text-center z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-8 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm p-2"
          >
            <img 
              src="/lovable-uploads/dd9d3876-4e65-4dd8-a78e-02c581e88a91.png" 
              alt="Gift"
              className="w-full h-full object-contain"
            />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-4">Ready to Gift!</h1>
          <p className="text-pink-200 text-lg">Let's spread some joy together</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <GradientBars colors={['#ec4899', 'transparent']} />
      
      {/* Floating Orbs */}
      <PulsingOrb size="w-64 h-64" color="bg-gradient-to-r from-pink-500 to-purple-600" delay={0} />
      <PulsingOrb size="w-48 h-48" color="bg-gradient-to-r from-purple-500 to-indigo-600" delay={1} />
      <PulsingOrb size="w-32 h-32" color="bg-gradient-to-r from-pink-400 to-rose-500" delay={2} />

      {/* Floating Icons */}
      <FloatingIcon icon={Gift} delay={0} className="top-1/4 left-1/4" />
      <FloatingIcon icon={Heart} delay={1} className="top-1/3 right-1/4" />
      <FloatingIcon icon={Star} delay={2} className="bottom-1/3 left-1/3" />
      <FloatingIcon icon={Sparkles} delay={3} className="bottom-1/4 right-1/3" />

      {/* Main Content */}
      <div className="text-center z-10 max-w-md mx-auto px-6">
        {/* Logo/Icon with uploaded image */}
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-20 h-20 mx-auto mb-8 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm shadow-2xl p-2"
        >
          <motion.img 
            src="/lovable-uploads/dd9d3876-4e65-4dd8-a78e-02c581e88a91.png" 
            alt="Gift"
            className="w-full h-full object-contain"
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Loading Text with Shimmer */}
        <div className="mb-8">
          <TextShimmer 
            as="h1"
            className="text-3xl font-bold text-white mb-2"
            duration={1.5}
          >
            {loadingText}
          </TextShimmer>
          <motion.p 
            className="text-pink-200 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Creating magical moments for creators
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4 overflow-hidden backdrop-blur-sm">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Progress Text */}
        <motion.p 
          className="text-white/80 text-sm font-medium"
          key={progress}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {progress}%
        </motion.p>

        {/* Funky Loading Dots */}
        <div className="flex justify-center space-x-2 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-pink-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Sparkle Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const ProfilePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pt-20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile header skeleton */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        {/* Content sections skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
        
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
};

export const LeaderboardPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-funky-purple via-funky-pink to-funky-blue pt-20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-64 mx-auto bg-white/20" />
          <Skeleton className="h-6 w-48 mx-auto bg-white/20" />
        </div>

        {/* Top 3 skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-3">
              <Skeleton className="h-20 w-20 rounded-full mx-auto bg-white/20" />
              <Skeleton className="h-4 w-24 mx-auto bg-white/20" />
              <Skeleton className="h-6 w-16 mx-auto bg-white/20" />
            </div>
          ))}
        </div>

        {/* List skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white/10 rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 bg-white/20" />
                <Skeleton className="h-3 w-24 bg-white/20" />
              </div>
              <Skeleton className="h-6 w-16 bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const GiftsListSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};