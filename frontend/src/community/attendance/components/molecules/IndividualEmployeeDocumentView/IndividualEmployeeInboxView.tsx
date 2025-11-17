import { Box, Typography, useTheme } from "@mui/material";
import { Table } from "@rootcodelabs/skapp-ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import FullScreenLoader from "~community/common/components/molecules/FullScreenLoader/FullScreenLoader";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";
import { useGetEnvelopeLimitation } from "~enterprise/sign/api/EnvelopeLimitationApi";
import {
  useGetAllInboxByUserId,
  useGetMySignatureLink
} from "~enterprise/sign/api/InboxApi";
import EnvelopeLimitModal from "~enterprise/sign/components/molecules/EnvelopeLimitModal/EnvelopeLimitModal";
import { useESignStore } from "~enterprise/sign/store/signStore";
import { Envelope } from "~enterprise/sign/types/CommonEsignTypes";
import {
  EnvelopeStatus,
  SortOption,
  SortOptionId,
  StatusOption,
  TableHeader,
  TableHeaderId,
  TableType
} from "~enterprise/sign/types/ESignInboxTypes";
import { usePreserveFilters } from "~enterprise/sign/utils/EnvelopeTableUtils";

import IndividualEmployeeDocumentViewTable from "./IndividualEmployeeDocumentTableView";
import NewTable from "./newTable";

interface Props {
  selectedUser: number;
}

const IndividualEmployeeInboxView: FC<Props> = ({ selectedUser }) => {
  const translateText = useTranslator("peopleModule", "inbox");
  const router = useRouter();
  const {
    inboxDataParams,
    setPage,
    setSize,
    setSortKey,
    setSortOrder,
    setStatusTypes,
    setSearchTerm
  } = useESignStore();

  const [isLoadingPage, setIsLoadingPage] = useState(false);

  // Current page params
  const UserData = selectedUser;
  const {
    data: InboxEnvelopeData,
    isLoading: isInboxLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    error
  } = useGetAllInboxByUserId(inboxDataParams, selectedUser);

  //   const envelopes: Envelope[] = InboxEnvelopeData?.items || [];
  const envelopes: Envelope[] = useMemo(() => {
    if (!InboxEnvelopeData?.pages) {
      console.log("No pages data:", InboxEnvelopeData);
      return [];
    }

    const flattenedData = InboxEnvelopeData.pages.reduce((acc, page) => {
      console.log("Processing page:", page);
      const items = page?.items || [];
      return [...acc, ...items];
    }, [] as Envelope[]);

    console.log("Flattened envelopes:", flattenedData.length, "items");
    console.log("Flattened envelopes data:", flattenedData);
    return flattenedData;
  }, [InboxEnvelopeData?.pages]);
  const { setPreserveFilters } = usePreserveFilters({ type: TableType.INBOX });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const totalItems = InboxEnvelopeData?.pages?.[0]?.totalItems || 0;
  const totalPages = InboxEnvelopeData?.pages?.[0]?.totalPages || 0;
  const currentPage = InboxEnvelopeData?.pages?.[0]?.currentPage || 0;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage) {
        
      fetchNextPage();
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    InboxEnvelopeData?.pages?.length
  ]);

  const handleRowClick = (envelope: Envelope) => {
    setPreserveFilters(true);
    router.push(ROUTES.SIGN.INBOX_INFO.ID(envelope.envelopeId));
  };

  const tableHeaders: TableHeader[] = [
    {
      id: TableHeaderId.NAME,
      label: translateText(["tableHeaders.documentName"])
    },
    {
      id: TableHeaderId.SENDER,
      label: translateText(["tableHeaders.sender"])
    },
    {
      id: TableHeaderId.RECEIVED_ON,
      label: translateText(["tableHeaders.recievedDate"])
    },
    {
      id: TableHeaderId.EXPIRES_ON,
      label: translateText(["tableHeaders.expireDate"])
    },
    { id: TableHeaderId.STATUS, label: translateText(["tableHeaders.status"]) }
  ];

  const sortOptions: SortOption[] = [
    {
      value: SortOptionId.RECEIVED_CLOSE,
      label: translateText(["dateSort.receivedClose"])
    },
    {
      value: SortOptionId.RECEIVED_FAR,
      label: translateText(["dateSort.receivedFar"])
    }
  ];

  const statusOptions: StatusOption[] = [
    {
      id: EnvelopeStatus.NEED_TO_SIGN,
      label: translateText(["documentStatus.needToSign"])
    },
    {
      id: EnvelopeStatus.DECLINED,
      label: translateText(["documentStatus.declined"])
    },
    {
      id: EnvelopeStatus.VOID,
      label: translateText(["documentStatus.voided"])
    },
    {
      id: EnvelopeStatus.COMPLETED,
      label: translateText(["documentStatus.completed"])
    },
    {
      id: EnvelopeStatus.EXPIRED,
      label: translateText(["documentStatus.expired"])
    },
    {
      id: EnvelopeStatus.WAITING,
      label: translateText(["documentStatus.waitingForOthers"])
    }
  ];

  useGoogleAnalyticsEvent({
    onMountEventType: GoogleAnalyticsTypes.GA4_ESIGN_INBOX_VIEWED,
    triggerOnMount: true
  });

  return (
    <>
      <ContentLayout
        pageHead={translateText(["pageHead"])}
        title={translateText(["allDocuments"])}
      >
        <>
          <IndividualEmployeeDocumentViewTable
            pageTitle=""
            isLoading={isInboxLoading}
            // Data
            envelopes={envelopes}
            tableHeaders={tableHeaders}
            sortOptions={sortOptions}
            statusOptions={statusOptions}
            inboxDataParams={inboxDataParams}
            totalItems={totalItems}
            totalPages={totalPages}
            currentPage={currentPage}
            isLoadingPage={isLoadingPage}
            currentSortOption={
              inboxDataParams.sortOrder === SortOrderTypes.DESC
                ? SortOptionId.RECEIVED_CLOSE
                : SortOptionId.RECEIVED_FAR
            }
            itemsPerPage={envelopes.length}
            searchTerm={inboxDataParams.searchKeyword}
            // Setters
            setSearchTerm={setSearchTerm}
            setPage={setPage}
            setSize={setSize}
            setSortKey={setSortKey}
            setSortOrder={setSortOrder}
            setStatusTypes={setStatusTypes}
            onRowClick={handleRowClick}
            hasNextPage={hasNextPage}
            onLoadMore={handleLoadMore}
            isFetchingNextPage={isFetchingNextPage}
            initialItemsToShow={envelopes.length}
          />
        </>
      </ContentLayout>
      <EnvelopeLimitModal />
    </>
  );
};

export default IndividualEmployeeInboxView;
