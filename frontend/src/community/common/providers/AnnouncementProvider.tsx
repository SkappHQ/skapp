import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { fetchEligibleAnnouncements } from "~enterprise/common/api/announcementApi";
import {
  getDataFromLocalStorage,
  removeDataFromLocalStorage,
  setDataToLocalStorage
} from "~community/common/utils/accessLocalStorage";
import { useAuth } from "~community/auth/providers/AuthProvider";
import { ActiveAnnouncementType, AnnouncementCacheType } from "../../../enterprise/common/types/AnnouncementTypes";

const CACHE_KEY = "announcementsCache";

interface AnnouncementContextType {
  announcements: ActiveAnnouncementType[];
  shownIds: Set<string>;
  markAsShown: (id: string) => void;
  clearAnnouncements: () => void;
}

const AnnouncementContext = createContext<AnnouncementContextType>({
  announcements: [],
  shownIds: new Set(),
  markAsShown: () => {},
  clearAnnouncements: () => {}
});

export const AnnouncementProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const { isAuthenticated } = useAuth();

  const [announcements, setAnnouncements] = useState<ActiveAnnouncementType[]>(
    []
  );
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());

  const isFetching = useRef(false);

  const loadFromCacheOrFetch = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    const announcementCache: AnnouncementCacheType | null =
      getDataFromLocalStorage(CACHE_KEY);

    if (announcementCache && Array.isArray(announcementCache.announcements)) {
      setAnnouncements(announcementCache.announcements);
    } else {
      const eligibleAnnouncements = await fetchEligibleAnnouncements();
      const cacheEntry: AnnouncementCacheType = {
        announcements: eligibleAnnouncements
      };
      setDataToLocalStorage(CACHE_KEY, cacheEntry);
      setAnnouncements(eligibleAnnouncements);
    }

    isFetching.current = false;
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadFromCacheOrFetch();
    } else {
      removeDataFromLocalStorage(CACHE_KEY);
      setAnnouncements([]);
      setShownIds(new Set());
      isFetching.current = false;
    }
  }, [isAuthenticated, loadFromCacheOrFetch]);

  const markAsShown = useCallback((id: string) => {
    setShownIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const clearAnnouncements = useCallback(() => {
    setAnnouncements([]);
    setShownIds(new Set());
    removeDataFromLocalStorage(CACHE_KEY);
  }, []);

  const value = useMemo(
    () => ({ announcements, shownIds, markAsShown, clearAnnouncements }),
    [announcements, shownIds, markAsShown, clearAnnouncements]
  );

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncements = (): AnnouncementContextType => {
  return useContext(AnnouncementContext);
};
