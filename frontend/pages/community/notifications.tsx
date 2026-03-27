import { NextPage } from "next";
import { useState } from "react";

import {
  useGetNotifications,
  useMarkAllNotificationsAsRead
} from "~community/common/api/notificationsApi";
import Notifications from "~community/common/components/organisms/Notifications/Notifications";
import FullWidthContentLayout from "~community/common/components/templates/FullWidthContentLayout/FullWidthContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";

const NotificationsPage: NextPage = () => {
  const translateText = useTranslator("notifications");
  const [currentPage] = useState<number>(0);
  const { data, isLoading, refetch } = useGetNotifications(
    currentPage,
    6,
    SortOrderTypes.DESC,
    SortKeyTypes.CREATED_DATE
  );
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();
  const { notifyData } = useCommonStore((state) => state);

  const notifications = data?.results?.[0];

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  return (
    <FullWidthContentLayout
      title={translateText(["title"])}
      primaryButtonProps={{
        variant: "tertiary",
        onClick: handleMarkAllRead,
        disabled: isLoading,
        children: translateText(["markAllAsReadButton"])
      }}
    >
      <>
        <Notifications
          data={notifications}
          isLoading={isLoading}
          refetch={refetch}
        />
        {/* <Pagination
          tableName={TableNames.NOTIFICATIONS}
          totalPages={data?.results?.[0].totalPages || 1}
          currentPage={currentPage}
          onChange={(_event: ChangeEvent<unknown>, value: number) =>
            // back-end pagination is starting from 0, so we need to subtract 1 from the value
            setCurrentPage(value - 1)
          }
        /> */}
      </>
    </FullWidthContentLayout>
  );
};
export default NotificationsPage;
