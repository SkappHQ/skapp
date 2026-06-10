import React, { ReactNode, createContext, useContext, useMemo } from "react";

interface AnnouncementContextType {
  announcements: never[];
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
  const value = useMemo<AnnouncementContextType>(
    () => ({
      announcements: [],
      shownIds: new Set(),
      markAsShown: () => {},
      clearAnnouncements: () => {}
    }),
    []
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
