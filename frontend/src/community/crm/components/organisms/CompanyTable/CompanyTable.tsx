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
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetCompanyMetrics } from "~community/crm/api/CompanyApi";
import {
  COMPANY_NAME_DEBOUNCE_DELAY,
  DEFAULT_PAGE_SIZE
} from "~community/crm/constants/companyConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompany } from "~community/crm/types/CommonTypes";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import { formatMonetaryValue } from "~community/crm/utils/commonHelpers";
import {
  formatPhoneNumber,
  formatTasks
} from "~community/crm/utils/tableHelpers";

export const CompanyTable: FC = () => {
  const translateText = useTranslator("crmModule", "companies");

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, COMPANY_NAME_DEBOUNCE_DELAY);
  const emptyStateType =
    debouncedSearch.trim() === ""
      ? EmptyStateTypeEnum.NO_DATA
      : EmptyStateTypeEnum.NO_SEARCH_RESULTS;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    useGetCompanyMetrics(debouncedSearch, DEFAULT_PAGE_SIZE);

  const { companies, setSelectedCompanyId, setCompanies, openCrmSidePanel } =
    useCrmStore((store) => ({
      companies: store.companies,
      setSelectedCompanyId: store.setSelectedCompanyId,
      setCompanies: store.setCompanies,
      openCrmSidePanel: store.openCrmSidePanel
    }));

  const fetchedCompanies = useMemo(() => {
    return data?.pages.flatMap((page) => page?.items ?? []);
  }, [data]);

  useEffect(() => {
    if (fetchedCompanies) setCompanies(fetchedCompanies);
  }, [fetchedCompanies]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  const columns: TableColumn<CrmCompany>[] = [
    {
      columnAriaLabel: translateText(["table", "columns", "nameAriaLabel"]),
      header: translateText(["table", "columns", "nameHeader"]),
      key: "name",
      render(value) {
        return (
          <span className="body2 block w-full truncate" title={value}>
            {value}
          </span>
        );
      },
      width: "25%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "phoneAriaLabel"]),
      header: translateText(["table", "columns", "phoneHeader"]),
      key: "contactNumber",
      render(_value, row) {
        return (
          <div className="flex items-baseline">
            {formatPhoneNumber(row.contactNumber)}
          </div>
        );
      },
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "tasksAriaLabel"]),
      header: translateText(["table", "columns", "tasksHeader"]),
      key: "openTasksCount",
      render(_value, row) {
        return (
          <div className="flex flex-row items-center gap-2">
            {formatTasks(row.openTasksCount)}
            {(row.overdue ?? 0) > 0 && (
              <Label
                backgroundColor="bg-semantic-red-background"
                textColor="text-semantic-red-text"
              >
                {`${row.overdue} ${translateText(["table", "overdueLabel"])}`}
              </Label>
            )}
          </div>
        );
      },
      width: "15%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "pipelineAriaLabel"]),
      header: translateText(["table", "columns", "pipelineHeader"]),
      key: "openValue",
      render(_value, row) {
        return (
          <div className="flex justify-end">
            {formatMonetaryValue(row.openValue)}
          </div>
        );
      },
      className: "text-right",
      width: "20%"
    },
    {
      columnAriaLabel: translateText([
        "table",
        "columns",
        "accountValueAriaLabel"
      ]),
      header: translateText(["table", "columns", "accountValueHeader"]),
      key: "accountValue",
      render(_value, row) {
        return (
          <div className="flex flex-col gap-1 text-right">
            <div>{formatMonetaryValue(row.accountValue)}</div>
            <div className="subtitle4 text-secondary-text">
              {(row.closedDeals ?? 0) > 0
                ? `${row.closedDeals} ${translateText(["table", "closedDealsLabel"])}`
                : ""}
            </div>
          </div>
        );
      },
      className: "text-right",
      width: "20%"
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
        data={companies ?? []}
        emptyStateType={emptyStateType}
        isLoading={
          isFetching && !isFetchingNextPage && (companies?.length ?? 0) === 0
        }
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
          description: translateText(["table", "emptyDataState", "description"])
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
        onRowClick={(row) => {
          setSelectedCompanyId(row.id);
          openCrmSidePanel(CrmSidePanelTypes.COMPANY_SIDE_PANEL);
        }}
      />
    </div>
  );
};
