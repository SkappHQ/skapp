import { Typography } from "@mui/material";
import { useRouter } from "next/router";
import { FC, useCallback, useMemo } from "react";

import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { SortOrderTypes } from "~community/common/types/CommonTypes";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";
import { useGetAllInboxByUserId } from "~enterprise/sign/api/InboxApi";
import { useESignStore } from "~enterprise/sign/store/signStore";
import { Envelope } from "~enterprise/sign/types/CommonEsignTypes";
import {
  EnvelopeStatus,
  SortOption,
  SortOptionId,
  StatusOption,
  TableType
} from "~enterprise/sign/types/ESignInboxTypes";
import { usePreserveFilters } from "~enterprise/sign/utils/EnvelopeTableUtils";

import IndividualEmployeeDocumentViewTable from "./IndividualEmployeeDocumentTableView";

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
      return [];
    }

    const flattenedData = InboxEnvelopeData.pages.reduce((acc, page) => {
      const items = page?.items || [];
      return [...acc, ...items];
    }, [] as Envelope[]);
    return flattenedData;
  }, [InboxEnvelopeData?.pages]);

  const { setPreserveFilters } = usePreserveFilters({ type: TableType.INBOX });

  const totalItems = InboxEnvelopeData?.pages?.[0]?.totalItems || 0;
  const totalPages = InboxEnvelopeData?.pages?.[0]?.totalPages || 0;
  const currentPage = InboxEnvelopeData?.pages?.[0]?.currentPage || 0;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, InboxEnvelopeData?.pages?.length]);

  const handleRowClick = (envelope: Envelope) => {
    setPreserveFilters(true);
    router.push(ROUTES.SIGN.INBOX_INFO.ID(envelope.envelopeId));
  };

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
      <Typography variant="h1" sx={{ paddingBottom: 2 }}>
        {translateText(["allDocuments"])}
      </Typography>
      <IndividualEmployeeDocumentViewTable
        isLoading={isInboxLoading}
        // Data
        envelopes={envelopes}
        sortOptions={sortOptions}
        statusOptions={statusOptions}
        inboxDataParams={inboxDataParams}
        totalItems={totalItems}
        totalPages={totalPages}
        currentSortOption={
          inboxDataParams.sortOrder === SortOrderTypes.DESC
            ? SortOptionId.RECEIVED_CLOSE
            : SortOptionId.RECEIVED_FAR
        }
        searchTerm={inboxDataParams.searchKeyword}
        // Setters
        setSearchTerm={setSearchTerm}
        setPage={setPage}
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
  );
};

export default IndividualEmployeeInboxView;
