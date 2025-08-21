import React, { useRef, useEffect, useState, ReactNode } from 'react';

interface IntersectionObserverProps {
  children: (inView: boolean) => ReactNode;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

const IntersectionObserver: React.FC<IntersectionObserverProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return <div ref={ref}>{children(inView)}</div>;
};

export default IntersectionObserver;