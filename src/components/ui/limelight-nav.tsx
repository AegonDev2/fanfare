import React, { useState, useRef, useLayoutEffect, cloneElement } from 'react';

// --- Internal Types and Defaults ---

const DefaultHomeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>;
const DefaultCompassIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" /></svg>;
const DefaultBellIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;

type NavItem = {
  id: string | number;
  icon: React.ReactElement;
  label?: string;
  onClick?: () => void;
};

const defaultNavItems: NavItem[] = [
  { id: 'default-home', icon: <DefaultHomeIcon />, label: 'Home' },
  { id: 'default-explore', icon: <DefaultCompassIcon />, label: 'Explore' },
  { id: 'default-notifications', icon: <DefaultBellIcon />, label: 'Notifications' },
];

type LimelightNavProps = {
  items?: NavItem[];
  defaultActiveIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
  limelightClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
};

/**
 * An adaptive-width navigation bar with a "limelight" effect that highlights the active item.
 */
export const LimelightNav = ({
  items = defaultNavItems,
  defaultActiveIndex = 0,
  onTabChange,
  className,
  limelightClassName,
  iconContainerClassName,
  iconClassName,
}: LimelightNavProps) => {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [isReady, setIsReady] = useState(false);
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const navItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (items.length === 0) return;

    const limelight = limelightRef.current;
    const activeItem = navItemRefs.current[activeIndex];
    
    if (limelight && activeItem) {
      const containerWidth = 56; // w-14 equivalent
      const newLeft = activeItem.offsetLeft + activeItem.offsetWidth / 2 - containerWidth / 2;
      limelight.style.left = `${Math.max(8, Math.min(newLeft, navItemRefs.current[navItemRefs.current.length - 1]?.offsetLeft || 0))}px`;

      if (!isReady) {
        setTimeout(() => setIsReady(true), 100);
      }
    }
  }, [activeIndex, isReady, items]);

  if (items.length === 0) {
    return null; 
  }

  const handleItemClick = (index: number, itemOnClick?: () => void) => {
    setActiveIndex(index);
    onTabChange?.(index);
    itemOnClick?.();
  };

  const handleTouchStart = (index: number) => {
    setPressedIndex(index);
  };

  const handleTouchEnd = () => {
    setPressedIndex(null);
  };

  return (
    <nav className={`relative inline-flex items-center h-16 rounded-full backdrop-blur-xl border border-white/10 px-3 shadow-xl ${className}`}>
      {items.map(({ id, icon, label, onClick }, index) => {
        const isActive = activeIndex === index;
        const isPressed = pressedIndex === index;
        
        return (
          <div
            key={id}
            ref={el => (navItemRefs.current[index] = el)}
            className={`relative z-20 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-all duration-300 ease-out transform ${
              isActive 
                ? 'scale-110' 
                : isPressed 
                ? 'scale-95' 
                : 'scale-100 hover:scale-105'
            } ${iconContainerClassName}`}
            onClick={() => handleItemClick(index, onClick)}
            onTouchStart={() => handleTouchStart(index)}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart(index)}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            aria-label={label}
          >
            {/* Background glow for active item */}
            {isActive && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-funky-purple/20 to-funky-pink/20 animate-pulse" />
            )}
            
            {/* Icon */}
            {cloneElement(icon, {
              className: `w-6 h-6 transition-all duration-300 ease-out relative z-10 ${
                isActive 
                  ? 'text-white drop-shadow-lg' 
                  : 'text-white/60 hover:text-white/80'
              } ${icon.props.className || ''} ${iconClassName || ''}`,
            })}

            {/* Active indicator dot */}
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
            )}
          </div>
        );
      })}

      {/* Animated background blob */}
      <div 
        ref={limelightRef}
        className={`absolute top-2 z-10 w-14 h-12 rounded-full bg-gradient-to-r from-funky-purple/30 to-funky-pink/30 backdrop-blur-sm border border-white/20 ${
          isReady ? 'transition-all duration-500 ease-out' : ''
        } ${limelightClassName}`}
        style={{ left: '-999px' }}
      >
        {/* Inner glow */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-r from-funky-purple/20 to-funky-pink/20 blur-sm" />
      </div>
    </nav>
  );
};