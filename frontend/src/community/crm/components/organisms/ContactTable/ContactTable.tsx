import {
  FilterIcon,
  IconButton,
  InputField,
  Label,
  ProjectTableSkeletonLoader,
  SearchIcon,
  Table,
  TableColumn
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, useMemo, useState } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetContactMetrics } from "~community/crm/api/CrmContactsApi";
import {
  CONTACT_NAME_DEBOUNCE_DELAY,
  DEFAULT_PAGE_SIZE
} from "~community/crm/constants/contactConstants";
import { CrmContactMetricsType } from "~community/crm/types/CommonTypes";
import {
  formatPhoneNumber,
  formatTasks,
  formatValue
} from "~community/crm/utils/companyTableHelpers";

export const ContactTable: React.FC = () => {
  const translateText = useTranslator("crmModule", "contacts");

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, CONTACT_NAME_DEBOUNCE_DELAY);
  const emptyStateType =
    debouncedSearch.trim() === ""
      ? EmptyStateTypeEnum.NO_DATA
      : EmptyStateTypeEnum.NO_SEARCH_RESULTS;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetContactMetrics(debouncedSearch, DEFAULT_PAGE_SIZE);

  const contacts = useMemo(
    () => data?.pages.flatMap((page) => page?.items ?? []),
    [data]
  );

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const columns: TableColumn<CrmContactMetricsType>[] = [
    {
      columnAriaLabel: translateText(["table", "columns", "nameAriaLabel"]),
      header: translateText(["table", "columns", "nameHeader"]),
      key: "name",
      width: "25%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "phoneAriaLabel"]),
      header: translateText(["table", "columns", "phoneHeader"]),
      key: "contactNumber",
      render(value) {
        return (
          <div className="flex items-baseline">{formatPhoneNumber(value)}</div>
        );
      },
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "tasksAriaLabel"]),
      header: translateText(["table", "columns", "tasksHeader"]),
      key: "openTaskCount",
      render(value, row) {
        return (
          <div className="flex flex-row items-center gap-2">
            {formatTasks(value)}
            {row.overdueTaskCount > 0 && (
              <Label
                backgroundColor="bg-semantic-red-background"
                textColor="text-semantic-red-text"
              >
                {`${row.overdueTaskCount} ${translateText(["table", "overdueLabel"])}`}
              </Label>
            )}
          </div>
        );
      },
      width: "15%"
    },
    {
      columnAriaLabel: translateText([
        "table",
        "columns",
        "closedValueAriaLabel"
      ]),
      header: translateText(["table", "columns", "closedValueHeader"]),
      key: "closedDealValue",
      render(value, row) {
        return (
          <div className="flex flex-col gap-1 text-right">
            <div>{formatValue(value)}</div>
            <div className="subtitle4 text-secondary-text">
              {row.closedDealCount > 0
                ? `${row.closedDealCount} ${translateText(["table", "closedDealsLabel"])}`
                : ""}
            </div>
          </div>
        );
      },
      className: "text-right",
      width: "40%"
    }
  ];

  const loadMore = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row gap-4 w-full h-[3rem] items-center justify-between">
        <InputField
          ariaLabelClearButton={translateText([
            "table",
            "clearButtonAriaLabel"
          ])}
          className="w-[25.75rem] h-[3rem]"
          placeholder={translateText(["table", "search"])}
          rightIcon={<SearchIcon />}
          state="default"
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          customStyles={{ borderRadius: "rounded-[1.5rem]" }}
        />
        <IconButton
          isRounded={true}
          variant="outlined"
          icon={<FilterIcon />}
          type="button"
          aria-label={translateText(["table", "filterButtonAriaLabel"])}
          disabled
        />
      </div>

      <Table
        columns={columns as TableColumn<any>[]}
        data={contacts ?? []}
        emptyStateType={emptyStateType}
        isLoading={isLoading && contacts?.length === 0}
        customSkeletonLoader={<ProjectTableSkeletonLoader rowCount={8} />}
        height="34.5rem"
        hasMore={hasNextPage}
        onLoadMore={loadMore}
        infiniteScrollLoadingMessage={translateText([
          "table",
          "infiniteScrollLoadingMessage"
        ])}
        noDataState={{
          icon: <SearchIcon />,
          title: translateText(["table", "emptyDataState", "title"]),
          description: translateText([
            "table",
            "emptyDataState",
            "description"
          ])
        }}
        noSearchResultsState={{
          icon: <SearchIcon />,
          title: translateText(["table", "emptySearchState", "title"]),
          description: translateText([
            "table",
            "emptySearchState",
            "description"
          ])
        }}
      />
    </div>
  );
};
