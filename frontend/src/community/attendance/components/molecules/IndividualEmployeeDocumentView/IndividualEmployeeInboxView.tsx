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
  useGetAllInbox,
  useGetMySignatureLink,
  useGetNeedToSignEnvelopeCount
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

interface Props {
  selectedUser: number;
}

const IndividualEmployeeInboxView: FC<Props> = ({ selectedUser }) => {
  const translateText = useTranslator("eSignatureModule", "inbox");
  const router = useRouter();
  const theme = useTheme();
  const { isESignSender } = useSessionData();
  const {
    inboxDataParams,
    setPage,
    setSize,
    setSortKey,
    setSortOrder,
    setStatusTypes,
    setSearchTerm,
    setShowEnvelopeLimitModal
  } = useESignStore();

  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([0])); // Load first page by default
  const [pageData, setPageData] = useState<Map<number, Envelope[]>>(new Map());
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(0);

  // Current page params
  const currentPageParams = useMemo(
    () => ({
      ...inboxDataParams,
      page: 0,
      size: 9999
    }),
    [inboxDataParams, currentPageNumber]
  );

  const { data: InboxEnvelopeData, isLoading: isInboxLoading } =
    useGetAllInbox(currentPageParams);
  const envelopes: Envelope[] = InboxEnvelopeData?.items || [];
  const UserData = selectedUser;
  const { data: personalData, isLoading: isPersonalDataLoading } =
    useGetUserPersonalDetails();
  const { data: mySignatureData, isLoading: isMySignatureLoading } =
    useGetMySignatureLink();
  const { setPreserveFilters } = usePreserveFilters({ type: TableType.INBOX });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const hasSignature = !!(
    mySignatureData?.mySignatureLink && mySignatureData?.mySignatureMethod
  );

  // Handle new page data
  useEffect(() => {
    if (InboxEnvelopeData && !isInboxLoading) {
      setPageData((prev) => {
        const newMap = new Map(prev);
        newMap.set(currentPageNumber, InboxEnvelopeData.items || []);
        return newMap;
      });
      setLoadedPages((prev) => new Set([...prev, currentPageNumber]));
      setIsLoadingPage(false);
    }
    console.log("InboxEnvelopeData", InboxEnvelopeData);
  }, [InboxEnvelopeData, isInboxLoading, currentPageNumber]);

  // Get current page envelopes
  const currentPageEnvelopes = pageData.get(currentPageNumber) || [];

  // Handle page load
  const handlePageLoad = useCallback(
    (page: number) => {
      if (!loadedPages.has(page)) {
        setIsLoadingPage(true);
        setCurrentPageNumber(page);
      }
    },
    [loadedPages]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPageNumber(page);
      if (!loadedPages.has(page)) {
        handlePageLoad(page);
      }
    },
    [loadedPages, handlePageLoad]
  );

  // Reset cache when filters change
  useEffect(() => {
    setLoadedPages(new Set([0]));
    setPageData(new Map());
    setCurrentPageNumber(0);
  }, [
    inboxDataParams.searchKeyword,
    inboxDataParams.statusTypes,
    inboxDataParams.sortKey,
    inboxDataParams.sortOrder
  ]);

  // Modified setters to reset cache
  const handleSetSearchTerm = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setLoadedPages(new Set([0]));
      setPageData(new Map());
      setCurrentPageNumber(0);
    },
    [setSearchTerm]
  );

  const handleSetStatusTypes = useCallback(
    (statuses: string) => {
      setStatusTypes(statuses);
      setLoadedPages(new Set([0]));
      setPageData(new Map());
      setCurrentPageNumber(0);
    },
    [setStatusTypes]
  );

  const handleSetSortKey = useCallback(
    (sortKey: any) => {
      setSortKey(sortKey);
      setLoadedPages(new Set([0]));
      setPageData(new Map());
      setCurrentPageNumber(0);
    },
    [setSortKey]
  );

  const handleSetSortOrder = useCallback(
    (sortOrder: any) => {
      setSortOrder(sortOrder);
      setLoadedPages(new Set([0]));
      setPageData(new Map());
      setCurrentPageNumber(0);
    },
    [setSortOrder]
  );
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

  useEffect(() => {
    if (
      !isInboxLoading &&
      !isPersonalDataLoading &&
      !isMySignatureLoading &&
      isInitialLoading
    ) {
      setIsInitialLoading(false);
    }
  }, [isInboxLoading, isPersonalDataLoading, isMySignatureLoading]);

  useGoogleAnalyticsEvent({
    onMountEventType: GoogleAnalyticsTypes.GA4_ESIGN_INBOX_VIEWED,
    triggerOnMount: true
  });

  if (isInitialLoading) {
    return <FullScreenLoader />;
  }
  return (
    <>
      <ContentLayout
        pageHead={translateText(["pageHead"])}
        title={translateText(["title"])}
      >
        <>
          <IndividualEmployeeDocumentViewTable
            pageTitle="inbox"
            isLoading={isInboxLoading}
            // Data
            envelopes={envelopes}
            tableHeaders={tableHeaders}
            sortOptions={sortOptions}
            statusOptions={statusOptions}
            inboxDataParams={inboxDataParams}
            loadedPages={loadedPages}
            isLoadingPage={isLoadingPage}
            onPageLoad={handlePageLoad}
            //Pagination
            currentSortOption={
              inboxDataParams.sortOrder === SortOrderTypes.DESC
                ? SortOptionId.RECEIVED_CLOSE
                : SortOptionId.RECEIVED_FAR
            }
            currentPage={InboxEnvelopeData?.currentPage || 0}
            itemsPerPage={inboxDataParams.size}
            totalItems={InboxEnvelopeData?.totalItems}
            totalPages={InboxEnvelopeData?.totalPages}
            searchTerm={inboxDataParams.searchKeyword}
            // Setters
            setSearchTerm={setSearchTerm}
            setPage={setPage}
            setSize={setSize}
            setSortKey={setSortKey}
            setSortOrder={setSortOrder}
            setStatusTypes={setStatusTypes}
            onRowClick={handleRowClick}
          />
        </>
      </ContentLayout>
      <EnvelopeLimitModal />
    </>
  );
};

export default IndividualEmployeeInboxView;
