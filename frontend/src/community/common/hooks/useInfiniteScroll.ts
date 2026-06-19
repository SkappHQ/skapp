'use client';
import { useCallback, useRef, useEffect } from 'react';

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}

export const useInfiniteScroll = ({
  hasNextPage,
  isLoading,
  onLoadMore,
  threshold = 1.0,
  rootMargin,
}: UseInfiniteScrollOptions) => {
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isLoading) {
        onLoadMore();
      }
    },
    [hasNextPage, isLoading, onLoadMore],
  );

  useEffect(() => {
    const element = loadingRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver, threshold, rootMargin]);

  return { loadingRef };
};
