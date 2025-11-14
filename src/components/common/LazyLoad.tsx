import React, { useEffect, useRef, useState } from "react";

interface LazyLoadProps {
  children: React.ReactNode;
  height?: string;
  fallback?: React.ReactNode;
  rootMargin?: string;
}

/**
 * LazyLoad component using Intersection Observer
 * Only renders children when component is in viewport
 * Optimizes performance by preventing unnecessary renders and API calls
 */
const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  height = "300px",
  fallback,
  rootMargin = "100px",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, stop observing
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        rootMargin, // Load content 100px before it enters viewport
        threshold: 0.01,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [rootMargin]);

  const defaultFallback = (
    <div
      className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse"
      style={{ minHeight: height }}
    >
      <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-800 mb-6"></div>
      <div className="h-full bg-gray-200 rounded dark:bg-gray-800"></div>
    </div>
  );

  return (
    <div ref={ref} style={{ minHeight: isVisible ? "auto" : height }}>
      {isVisible ? children : fallback || defaultFallback}
    </div>
  );
};

export default LazyLoad;
