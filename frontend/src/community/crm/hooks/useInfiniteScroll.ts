import { RefObject, useCallback, useEffect, useRef } from "react";
import { DEFAULT_SCROLL_THRESHOLD } from "~community/crm/constants/taskConstants";

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  threshold?: number;
}

const useInfiniteScroll = <T extends HTMLElement>({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = DEFAULT_SCROLL_THRESHOLD
}: UseInfiniteScrollOptions): RefObject<T> => {
  const ref = useRef<T>(null);

  const handleScroll = useCallback(() => {
    const element = ref.current;
    if (!element || !hasNextPage || isFetchingNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    if (scrollPercentage > threshold) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, threshold]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("scroll", handleScroll);
    return () => element.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return ref;
};

export default useInfiniteScroll;
