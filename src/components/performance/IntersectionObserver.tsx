import React, { useEffect, useRef, useState } from 'react';

interface IntersectionObserverProps {
  children: React.ReactNode;
  onInView?: () => void;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const IntersectionObserverWrapper: React.FC<IntersectionObserverProps> = ({
  children,
  onInView,
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            onInView?.();
            if (triggerOnce) {
              observer.disconnect();
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [onInView, threshold, rootMargin, triggerOnce]);

  return <div ref={ref}>{isInView && children}</div>;
};
