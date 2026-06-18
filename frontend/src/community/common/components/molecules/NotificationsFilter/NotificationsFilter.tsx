import { Tabs } from "@rootcodelabs/skapp-ui";
import { JSX } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import { NotifyFilterButtonTypes } from "~community/common/types/notificationTypes";

interface Props {
  filterButton: NotifyFilterButtonTypes;
  setFilterButton: (value: { filterButton: NotifyFilterButtonTypes }) => void;
}

const NotificationsFilter = ({
  filterButton,
  setFilterButton
}: Props): JSX.Element => {
  const translateText = useTranslator("notifications");
  const { notifyData } = useCommonStore((state) => state);

  const tabs = [
    { id: "all", label: translateText(["allFilterButtonText"]) },
    {
      id: "unread",
      label: (
        <span className="inline-flex items-center gap-2">
          {translateText(["unreadFilterButtonText"])}
          {notifyData.unreadCount > 0 && (
            <span className="inline-flex items-center justify-center bg-primary-text text-white subtitle4 px-2 rounded-full">
              {notifyData.unreadCount}
            </span>
          )}
        </span>
      )
    }
  ];

  const activeTabId =
    filterButton === NotifyFilterButtonTypes.ALL ? "all" : "unread";

  return (
    <div className="border-b border-secondary-accent">
      <Tabs
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={(tabId: string) => {
          const newFilter =
            tabId === "all"
              ? NotifyFilterButtonTypes.ALL
              : NotifyFilterButtonTypes.UNREAD;
          setFilterButton({ filterButton: newFilter });
        }}
      />
    </div>
  );
};

export default NotificationsFilter;
