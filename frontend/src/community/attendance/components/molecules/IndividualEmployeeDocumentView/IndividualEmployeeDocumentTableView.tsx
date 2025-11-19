import { Box, Typography, useTheme } from "@mui/material";
import { Table } from "@rootcodelabs/skapp-ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { formatISODateWithSuffix } from "~community/common/utils/dateTimeUtils";
import { TableVariants } from "~community/people/enums/PeopleEnums";
import EnvelopeTableStatusFilter, {
  StatusOption
} from "~enterprise/sign/components/molecules/EnvelopeTableStatusFilter/EnvelopeTableStatusFilter";
import { Envelope } from "~enterprise/sign/types/CommonEsignTypes";
import {
  EnvelopeStatus,
  GetAllInboxParams,
  GetAllSentParams,
  SortKey,
  SortOption,
  SortOptionId
} from "~enterprise/sign/types/ESignInboxTypes";
import { IsExpiringSoon } from "~enterprise/sign/utils/EnvelopeTableUtils";
import {
  GetEnvelopeStatusIcon,
  GetStatusText
} from "~enterprise/sign/utils/envelopeStatusUtils";

import { Styles } from "./styles";

interface TableColumn<T> {
  key: string;
  header: string;
  width?: string;
  className?: string;
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
  columnAriaLabel?: string;
  getCellAriaLabel?: (value: T[keyof T], row: T, index: number) => string;
}

interface IndividualEmployeeDocumentTableViewProps {
  isLoading?: boolean;
  envelopes: Envelope[];
  onRowClick?: (envelope: Envelope) => void;
  sortOptions: SortOption[];
  statusOptions: StatusOption[];
  searchTerm?: string;
  totalItems: number;
  totalPages: number;
  currentSortOption: SortOptionId;
  inboxDataParams?: GetAllInboxParams;
  sentDataParams?: GetAllSentParams;
  setSearchTerm: (searchTerm: string) => void;
  setPage: (page: number) => void;
  setSortKey: (sortKey: SortKey) => void;
  setSortOrder: (sortOrder: SortOrderTypes) => void;
  setStatusTypes: (statuses: string) => void;
  loadedPages?: Set<number>;
  onPageLoad?: (page: number) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  initialItemsToShow?: number;
}

const IndividualEmployeeDocumentTableView: React.FC<
  IndividualEmployeeDocumentTableViewProps
> = ({
  envelopes,
  onRowClick,
  sortOptions,
  statusOptions,
  searchTerm,
  totalItems,
  setSearchTerm,
  setPage,
  setSortKey,
  setSortOrder,
  setStatusTypes,
  currentSortOption: initialSortOption,
  isLoading,
  inboxDataParams,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  initialItemsToShow = 6
}) => {
  const theme = useTheme();

  const { data: userData } = useSession();
  const userRoles = userData?.user.roles || [];
  const hasAdminRoles =
    userRoles.includes(AdminTypes.PEOPLE_ADMIN) ||
    userRoles.includes(AdminTypes.SUPER_ADMIN);

  const translateText = useTranslator("peopleModule", "inbox");
  const translateAria = useTranslator("eSignatureModuleAria", "components");
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const styles = Styles(theme);

  const [currentSortOption, setCurrentSortOption] =
    useState<SortOptionId>(initialSortOption);
  const [displayedItems, setDisplayedItems] = useState(initialItemsToShow);

  // Reset displayed items when envelopes change (new search/filter)
  useEffect(() => {
    setDisplayedItems(initialItemsToShow);
  }, [envelopes.length, initialItemsToShow, searchTerm]);

  const handleStatusFilter = (statuses: string) => {
    setStatusTypes(statuses);
  };

  const scrollToTop = useCallback(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const shouldShowExpiringNotification = (envelope: Envelope): boolean => {
    return (
      IsExpiringSoon(envelope.expiresAt) &&
      envelope.status !== EnvelopeStatus.COMPLETED &&
      envelope.status !== EnvelopeStatus.DECLINED &&
      envelope.status !== EnvelopeStatus.VOID
    );
  };

  // Render functions for each column
  const renderName = (value: string, envelope: Envelope) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        width: "100%"
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Icon
          name={IconName.FILE_ICON}
          width="1.5rem"
          height="1.5rem"
          fill={theme.palette.primary.dark}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "calc(100% - 2.25rem)"
        }}
      >
        <Typography variant="label" sx={styles.truncatedText}>
          {envelope.subject}
        </Typography>
        {hasAdminRoles && envelope.sender && (
          <Typography
            variant="caption"
            color={theme.palette.text.secondary}
            sx={styles.truncatedText}
          >
            {translateText(["sentBy"])} : {envelope.sender.email}
          </Typography>
        )}
      </Box>
    </Box>
  );

  const renderSender = (value: string, envelope: Envelope) => (
    <Avatar
      firstName={envelope.sender?.firstName || ""}
      lastName={envelope.sender?.lastName || ""}
      src={envelope.sender?.profilePic || ""}
    />
  );

  const renderReceivedOn = (value: string, envelope: Envelope) => (
    <Typography variant="body1">
      {formatISODateWithSuffix(envelope.receivedDate)}
    </Typography>
  );

  const renderExpiresOn = (value: string, envelope: Envelope) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem"
      }}
    >
      {shouldShowExpiringNotification(envelope) ? (
        <>
          <Typography
            variant="body1"
            sx={{ color: theme.palette.text.darkerRedText }}
          >
            {formatISODateWithSuffix(envelope.expiresAt)}
          </Typography>
          <Icon
            name={IconName.CLOCK_ICON}
            width="1rem"
            height="1rem"
            fill={theme.palette.text.darkerRedText}
          />
        </>
      ) : (
        <Typography variant="body1">
          {formatISODateWithSuffix(envelope.expiresAt)}
        </Typography>
      )}
    </Box>
  );

  const renderStatus = (value: unknown, envelope: Envelope) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        borderRadius: "4rem",
        backgroundColor: theme.palette.grey[50],
        padding: "0.75rem 1.5rem 0.75rem 1.25rem"
      }}
    >
      {GetEnvelopeStatusIcon(envelope.status)}
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
        {translateText([GetStatusText(envelope.status)])}
      </Typography>
    </Box>
  );

  const getTableRows = () => {
    if (totalItems === 0) return [];

    // Only show the first 'displayedItems' number of items
    const itemsToShow = envelopes.slice(0, displayedItems);

    return itemsToShow.map((envelope, index) => {
      const statusText = translateText([GetStatusText(envelope.status)]);
      const senderName = envelope.sender
        ? `${envelope.sender.firstName} ${envelope.sender.lastName}`
        : translateText(["unknownSender"]);
      const dateLabel = translateAria(["envelopeTable.receivedOn"]);

      const dateValue = formatISODateWithSuffix(envelope.receivedDate);

      const expiryDate = formatISODateWithSuffix(envelope.expiresAt);

      const rowAriaLabel = translateAria(["envelopeTable.rowDescription"], {
        rowIndex: index + 1,
        subject: envelope.subject,
        sender: senderName,
        dateLabel: dateLabel,
        date: dateValue,
        expiryDate: expiryDate,
        status: statusText
      });

      return {
        ...envelope,
        ariaLabel: {
          row: rowAriaLabel
        },
        name: envelope.subject,
        sender: envelope.sender,
        receivedOn: dateValue,
        expiresOn: envelope.expiresAt,
        status: envelope.status
      };
    });
  };

  const renderActionRowTwoRightButton = (
    <Box sx={styles.actionButtonsContainer}>
      <SearchBox
        placeHolder={translateText(["searchPlaceholder"])}
        setSearchTerm={(term) => {
          setSearchTerm(term);
          setPage(0);
        }}
        value={searchTerm}
        fullWidth={false}
        searchBoxStyles={{ width: "21.875rem", borderRadius: "1.5rem" }}
        name="envelopeSearch"
        accessibility={{
          ariaHidden: false
        }}
      />
      <EnvelopeTableStatusFilter
        statusOptions={statusOptions}
        currentStatusTypes={inboxDataParams?.statusTypes}
        onApplyFilters={(statuses) => {
          handleStatusFilter(statuses);
          setPage(0);
        }}
        onResetFilters={() => {
          handleStatusFilter("");
          setPage(0);
        }}
      />
    </Box>
  );

  const envelopeColumns: TableColumn<any>[] = [
    {
      key: "name",
      header: translateText(["tableHeaders.documentName"]),
      width: "35%",
      render: renderName,
      columnAriaLabel: translateText(["tableHeaders.documentName"]),
      getCellAriaLabel: (row: any) =>
        `${translateText(["tableHeaders.documentName"])}: ${row.subject}`,
      className: "px-4"
    },
    {
      key: "sender",
      header: translateText(["tableHeaders.sender"]),
      width: "10%",
      render: renderSender,
      columnAriaLabel: translateText(["tableHeaders.sender"]),
      getCellAriaLabel: (row: any) => {
        return `${translateText(["tableHeaders.sender"])} ${row.sender?.firstName} ${row.sender?.lastName}`;
      },
      className: "px-4"
    },
    {
      key: "receivedOn",
      header: translateText(["tableHeaders.receievedDate"]),
      width: "20%",
      render: renderReceivedOn,
      columnAriaLabel: translateText(["tableHeaders.receievedDate"]),
      getCellAriaLabel: (row: any) => {
        const date = formatISODateWithSuffix(row.receivedDate);
        return `${translateText(["tableHeaders.receievedDate"])} ${date}`;
      },
      className: "px-4"
    },
    {
      key: "expiresOn",
      header: translateText(["tableHeaders.expireDate"]),
      width: "20%",
      render: renderExpiresOn,
      columnAriaLabel: translateText(["tableHeaders.expireDate"]),
      getCellAriaLabel: (row: any) => {
        const isExpiring = shouldShowExpiringNotification(row);
        const date = formatISODateWithSuffix(row.expiresAt);
        return `${translateText(["tableHeaders.expireDate"])}: ${date}${isExpiring ? `${translateText(["expireSoon"])}` : ""}`;
      },
      className: "px-4"
    },
    {
      key: "status",
      header: translateText(["tableHeaders.status"]),
      width: "15%",
      render: renderStatus,
      columnAriaLabel: translateText(["tableHeaders.status"]),
      getCellAriaLabel: (row: any) =>
        `${translateText(["tableHeaders.status"])} ${translateText([GetStatusText(row.status)])}`,
      className: "px-4"
    }
  ];

  const renderActionRowTwoLeftButton = (
    <DropdownList
      inputName="sortOption"
      value={currentSortOption}
      itemList={sortOptions.map((option) => ({
        label: option.label,
        value: option.value
      }))}
      ariaLabel={translateAria(["envelopeTable.sortInbox"])}
      onChange={(event) => {
        const selectedOptionId = event.target.value as SortOptionId;
        setPage(0);
        setCurrentSortOption(selectedOptionId);

        if (setSortKey && setSortOrder) {
          setSortKey(SortKey.RECEIVED_DATE);
          switch (selectedOptionId) {
            case SortOptionId.RECEIVED_CLOSE:
              setSortOrder(SortOrderTypes.DESC);
              break;
            case SortOptionId.RECEIVED_FAR:
              setSortOrder(SortOrderTypes.ASC);
              break;
            default:
              break;
          }
        }
        scrollToTop();
      }}
      isDisabled={totalItems === 0}
      paperStyles={{
        minWidth: "19.5rem",
        width: "auto",
        borderRadius: "2.188rem"
      }}
      checkSelected={true}
    />
  );
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "1.25rem"
        }}
      >
        {renderActionRowTwoLeftButton}
        {renderActionRowTwoRightButton}
      </Box>
      <Box ref={scrollContainerRef}>
        <Table
          columns={envelopeColumns}
          data={getTableRows()}
          onRowClick={(row) => onRowClick && onRowClick(row)}
          variant={TableVariants.CARD}
          noDataState={{
            icon: (
              <Icon
                name={IconName.FILE_ICON}
                width="4rem"
                height="4rem"
                fill={theme.palette.grey[300]}
              />
            ),
            title: translateText(["emptyTable.title"]),
            description: translateText(["emptyTable.description"])
          }}
          hasMore={hasNextPage}
          isLoading={isLoading || isFetchingNextPage}
          scrollThreshold={0.8}
          onLoadMore={onLoadMore}
          infiniteScrollLoadingMessage={translateText(["loadingMore"])}
        />
      </Box>
    </>
  );
};

export default IndividualEmployeeDocumentTableView;
