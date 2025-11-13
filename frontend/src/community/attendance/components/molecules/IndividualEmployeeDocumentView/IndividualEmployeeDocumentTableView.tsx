import { Box, Typography, useTheme } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import AvatarGroup from "~community/common/components/molecules/AvatarGroup/AvatarGroup";
import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import Table from "~community/common/components/molecules/Table/Table";
import ROUTES from "~community/common/constants/routes";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { formatISODateWithSuffix } from "~community/common/utils/dateTimeUtils";
import { TableNames } from "~enterprise/common/enums/Table";
import EnvelopeTableStatusFilter, {
  StatusOption
} from "~enterprise/sign/components/molecules/EnvelopeTableStatusFilter/EnvelopeTableStatusFilter";
import { ItemsPerPage } from "~enterprise/sign/constants";
import { Envelope, Recipient } from "~enterprise/sign/types/CommonEsignTypes";
import {
  EnvelopeStatus,
  GetAllInboxParams,
  GetAllSentParams,
  SortKey,
  SortOption,
  SortOptionId,
  TableHeader
} from "~enterprise/sign/types/ESignInboxTypes";
import { IsExpiringSoon } from "~enterprise/sign/utils/EnvelopeTableUtils";
import {
  GetEnvelopeStatusIcon,
  GetStatusText
} from "~enterprise/sign/utils/envelopeStatusUtils";

import { Styles } from "./styles";

interface IndividualEmployeeDocumentTableViewProps {
  pageTitle: string;
  isInboxTable?: boolean;
  showEmptyTableCreateButton?: boolean;
  isLoading?: boolean;
  envelopes: Envelope[];
  onRowClick?: (envelope: Envelope) => void;
  tableHeaders: TableHeader[];
  sortOptions: SortOption[];
  statusOptions: StatusOption[];
  itemsPerPage: number;
  searchTerm?: string;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  currentSortOption: SortOptionId;
  inboxDataParams?: GetAllInboxParams;
  sentDataParams?: GetAllSentParams;
  setSearchTerm: (searchTerm: string) => void;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  setSortKey: (sortKey: SortKey) => void;
  setSortOrder: (sortOrder: SortOrderTypes) => void;
  setStatusTypes: (statuses: string) => void;
  loadedPages?: Set<number>;
  isLoadingPage?: boolean;
  onPageLoad?: (page: number) => void;
  // New props for infinite scroll
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  initialItemsToShow?: number;
}

const IndividualEmployeeDocumentTableView: React.FC<
  IndividualEmployeeDocumentTableViewProps
> = ({
  pageTitle,
  envelopes,
  onRowClick,
  tableHeaders,
  sortOptions,
  statusOptions,
  itemsPerPage,
  searchTerm,
  currentPage,
  totalItems,
  totalPages,
  setSearchTerm,
  setPage,
  setSize,
  setSortKey,
  setSortOrder,
  setStatusTypes,
  currentSortOption: initialSortOption,
  isInboxTable = true,
  showEmptyTableCreateButton = false,
  isLoading = false,
  inboxDataParams,
  sentDataParams,
  loadedPages = new Set(),
  isLoadingPage = false,
  onPageLoad,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  initialItemsToShow = 6
}) => {
  const theme = useTheme();

  const { data: UserData } = useSession();
  const userRoles = UserData?.user.roles || [];
  const hasAdminRoles = userRoles.includes(AdminTypes.ESIGN_ADMIN);
  const router = useRouter();
  const translateText = useTranslator("eSignatureModule", pageTitle);
  const translateAria = useTranslator("eSignatureModuleAria", "components");
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  const styles = Styles(theme);

  const [currentSortOption, setCurrentSortOption] =
    useState<SortOptionId>(initialSortOption);
  const [displayedItems, setDisplayedItems] = useState(initialItemsToShow);

  // Reset displayed items when envelopes change (new search/filter)
  useEffect(() => {
    setDisplayedItems(initialItemsToShow);
  }, [envelopes.length, initialItemsToShow, searchTerm]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const loadMoreTrigger = loadMoreTriggerRef.current;
    const scrollContainer = scrollContainerRef.current;

    if (!loadMoreTrigger || !scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          // Check if we need to show more items from current data
          if (displayedItems < envelopes.length) {
            setDisplayedItems((prev) =>
              Math.min(prev + initialItemsToShow, envelopes.length)
            );
          }
          // Check if we need to fetch more data from server
          else if (hasNextPage && !isFetchingNextPage && onLoadMore) {
            console.log("Fetching more data from server...");
            onLoadMore();
          }
        }
      },
      {
        root: scrollContainer,
        rootMargin: "200px",
        threshold: 0.1
      }
    );

    observer.observe(loadMoreTrigger);

    return () => {
      if (loadMoreTrigger) {
        observer.unobserve(loadMoreTrigger);
      }
    };
  }, [
    displayedItems,
    envelopes.length,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    initialItemsToShow
  ]);

  // Scroll percentage approach (80% threshold)
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage >= 0.8) {
        // Show more items from current data
        if (displayedItems < envelopes.length) {
          setDisplayedItems((prev) =>
            Math.min(prev + initialItemsToShow, envelopes.length)
          );
        }
        // Fetch more data from server
        else if (hasNextPage && !isFetchingNextPage && onLoadMore) {
          console.log("80% scroll reached - fetching more data...");
          onLoadMore();
        }
      }
    },
    [
      displayedItems,
      envelopes.length,
      hasNextPage,
      isFetchingNextPage,
      onLoadMore,
      initialItemsToShow
    ]
  );

  const handleStatusFilter = (statuses: string) => {
    setStatusTypes(statuses);
  };

  const scrollToTop = useCallback(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handlePageChange = useCallback(
    (event: ChangeEvent<unknown>, value: number) => {
      const newPage = value - 1;
      setPage(newPage);

      // Trigger lazy loading if page not loaded yet
      if (onPageLoad && !loadedPages.has(newPage)) {
        onPageLoad(newPage);
      }

      scrollToTop();
    },
    [setPage, onPageLoad, loadedPages, scrollToTop]
  );

  const shouldShowExpiringNotification = (
    envelope: Envelope,
    isInboxTable: boolean
  ): boolean => {
    return (
      isInboxTable &&
      IsExpiringSoon(envelope.expiresAt) &&
      envelope.status !== EnvelopeStatus.COMPLETED &&
      envelope.status !== EnvelopeStatus.DECLINED &&
      envelope.status !== EnvelopeStatus.VOID
    );
  };

  const getTableRows = () => {
    if (totalItems === 0) return [];

    // Only show the first 'displayedItems' number of items
    const itemsToShow = envelopes.slice(0, displayedItems);

    return itemsToShow.map((envelope, index) => {
      const statusText = translateText([GetStatusText(envelope.status)]);
      const senderName = envelope.sender
        ? `${envelope.sender.firstName} ${envelope.sender.lastName}`
        : "Unknown Sender";
      const dateLabel = isInboxTable
        ? translateAria(["envelopeTable.receivedOn"])
        : translateAria(["envelopeTable.createdOn"]);
      const dateValue = isInboxTable
        ? formatISODateWithSuffix(envelope.receivedDate)
        : formatISODateWithSuffix(envelope.sentAt);
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
        name: (
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
              {!isInboxTable && hasAdminRoles && envelope.sender && (
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
        ),
        sender: isInboxTable ? (
          <Avatar
            firstName={envelope.sender.firstName}
            lastName={envelope.sender.lastName}
            src={envelope.sender.profilePic || ""}
          />
        ) : (
          <AvatarGroup
            avatars={envelope.recipients.map((recipient: Recipient) => ({
              firstName: recipient.addressBook.firstName,
              lastName: recipient.addressBook.lastName,
              image: recipient.addressBook.profilePic
            }))}
            componentStyles={{
              ".MuiAvatarGroup-avatar": {
                bgcolor: theme.palette.grey[100],
                color: theme.palette.primary.dark,
                fontSize: "0.875rem",
                height: "2.5rem",
                width: "2.5rem",
                fontWeight: 400,
                flexDirection: "row-reverse"
              }
            }}
            max={2}
          />
        ),
        receivedOn: (
          <Typography variant="body1">
            {isInboxTable
              ? formatISODateWithSuffix(envelope.receivedDate)
              : formatISODateWithSuffix(envelope.sentAt)}
          </Typography>
        ),
        expiresOn: (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            {shouldShowExpiringNotification(envelope, isInboxTable) ? (
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
        ),
        status: (
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
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              {translateText([GetStatusText(envelope.status)])}
            </Typography>
          </Box>
        )
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
        currentStatusTypes={
          isInboxTable
            ? inboxDataParams?.statusTypes
            : sentDataParams?.statusTypes
        }
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

  const renderActionRowTwoLeftButton = (
    <DropdownList
      inputName="sortOption"
      value={currentSortOption}
      itemList={sortOptions.map((option) => ({
        label: option.label,
        value: option.value
      }))}
      ariaLabel={
        isInboxTable
          ? translateAria(["envelopeTable.sortInbox"])
          : translateAria(["envelopeTable.sortSent"])
      }
      onChange={(event) => {
        const selectedOptionId = event.target.value as SortOptionId;
        setPage(0);
        setCurrentSortOption(selectedOptionId);

        if (setSortKey && setSortOrder) {
          if (isInboxTable) {
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
          } else {
            setSortKey(SortKey.CREATED_DATE);
            switch (selectedOptionId) {
              case SortOptionId.CREATED_CLOSE:
                setSortOrder(SortOrderTypes.DESC);
                break;
              case SortOptionId.CREATED_FAR:
                setSortOrder(SortOrderTypes.ASC);
                break;
              default:
                break;
            }
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

  // Loading indicator component
  const LoadingIndicator = () => (
    <Box
      ref={loadMoreTriggerRef}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
        minHeight: "60px"
      }}
    >
      {(isFetchingNextPage || displayedItems < envelopes.length) && (
        <Typography variant="body2" color="textSecondary">
          {isFetchingNextPage ? "Loading more..." : "Scroll for more"}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box
      ref={scrollContainerRef}
      onScroll={handleScroll}
      //   sx={{
      //     maxHeight: '70vh',
      //     overflow: 'auto',
      //     position: 'relative'
      //   }}
    >
      <Table
        tableName={TableNames.ENVELOPE}
        headers={tableHeaders}
        rows={getTableRows()}
        isLoading={isLoading && displayedItems === 0}
        checkboxSelection={{
          isEnabled: false
        }}
        actionToolbar={{
          firstRow: {
            leftButton: renderActionRowTwoLeftButton,
            rightButton: renderActionRowTwoRightButton
          },
          customStyles: {
            wrapper: {
              paddingY: "1.5rem",
              paddingX: "0rem"
            }
          }
        }}
        tableBody={{
          emptyState: {
            noData: {
              title: translateText(["emptyTable.title"]),
              description: translateText(["emptyTable.description"]),
              customStyles: {
                container: { width: "100%" }
              },
              button: showEmptyTableCreateButton
                ? {
                    buttonStyle: ButtonStyle.PRIMARY,
                    label: translateText(["emptyTable.createButton"]),
                    endIcon: IconName.ADD_ICON,
                    shouldBlink: true,
                    onClick: () => router.push(ROUTES.SIGN.CREATE_DOCUMENT)
                  }
                : undefined
            }
          },
          loadingState: {
            skeleton: {
              rows: Math.min(initialItemsToShow, itemsPerPage)
            }
          },
          onRowClick: onRowClick,
          customStyles: {
            row: {
              active: styles.tableRow
            },
            cell: {
              wrapper: {
                borderBottom: "none"
              }
            }
          }
        }}
        tableFoot={{
          pagination: {
            isEnabled: false
          },
          customStyles: {
            wrapper: styles.paginationWithNumOfRows
          }
        }}
        customStyles={{
          wrapper: styles.tableWrapper,
          container: styles.tableActionRowWrapper,
          table: {
            borderSpacing: "0 1rem",
            paddingX: "0.12rem",
            backgroundColor:
              totalItems > 0 ? theme.palette.background.paper : undefined
          }
        }}
        tableContainerRef={tableContainerRef}
      />

      {/* Loading indicator at bottom */}
      {totalItems > 0 && (hasNextPage || displayedItems < envelopes.length) && (
        <LoadingIndicator />
      )}
    </Box>
  );
};

export default IndividualEmployeeDocumentTableView;
