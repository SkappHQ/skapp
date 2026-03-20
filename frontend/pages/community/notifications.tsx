import { NextPage } from "next";
import { ChangeEvent, useState } from "react";

import { useGetNotifications } from "~community/common/api/notificationsApi";
import Pagination from "~community/common/components/atoms/Pagination/Pagination";
import Notifications from "~community/common/components/organisms/Notifications/Notifications";
import FullWidthContentLayout from "~community/common/components/templates/FullWidthContentLayout/FullWidthContentLayout";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";

const NotificationsPage: NextPage = () => {
  const translateText = useTranslator("notifications");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const { data, isLoading, refetch } = useGetNotifications(
    currentPage,
    6,
    SortOrderTypes.DESC,
    SortKeyTypes.CREATED_DATE
  );

  const notifications = data?.results?.[0];

  return (
    <FullWidthContentLayout title={translateText(["title"])} primaryButtonProps={{la}}>
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
