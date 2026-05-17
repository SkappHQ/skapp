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

import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetCompanyMetrics } from "~community/crm/api/CompanyApi";
import { companyTableColumns } from "~community/crm/constants/companyTableConstants";
import { EmptyStateTypeEnum } from "~community/crm/enums/CrmCompanyEnums";
import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";

import styles from "./styles";

export const CompanyTable: React.FC = () => {
  const translateText = useTranslator("crmModule", "companies");

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const emptyStateType =
    debouncedSearch.trim() === ""
      ? EmptyStateTypeEnum.NO_DATA
      : EmptyStateTypeEnum.NO_SEARCH_RESULTS;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetCompanyMetrics(debouncedSearch, 12);

  const companies = useMemo(() => {
    return data?.pages.flatMap((page) => page?.items ?? []) ?? [];
  }, [data]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  const columns: TableColumn<CrmCompanyMetricsType>[] = [
    {
      columnAriaLabel: translateText(["table", "columns", "nameAriaLabel"]),
      header: translateText(["table", "columns", "nameHeader"]),
      key: companyTableColumns.NAME,
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "phoneAriaLabel"]),
      header: translateText(["table", "columns", "phoneHeader"]),
      key: companyTableColumns.CONTACT_NUMBER,
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "tasksAriaLabel"]),
      header: translateText(["table", "columns", "tasksHeader"]),
      key: companyTableColumns.TASKS,
      render(value, row) {
        return (
          <div className="flex flex-row items-center gap-2">
            <div className="font-medium text-gray-900">{`${value}`}</div>
            {row.overdue > 0 && (
              <Label
                backgroundColor="bg-red-100"
                textColor="text-red-900"
              >{`${row.overdue} overdue`}</Label>
            )}
          </div>
        );
      },
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "pipelineAriaLabel"]),
      header: translateText(["table", "columns", "pipelineHeader"]),
      key: companyTableColumns.OPEN_VALUE,
      render(value) {
        return `$${value}`;
      },
      width: "20%"
    },
    {
      columnAriaLabel: translateText([
        "table",
        "columns",
        "accountValueAriaLabel"
      ]),
      header: translateText(["table", "columns", "accountValueHeader"]),
      key: companyTableColumns.ACCOUNT_VALUE,
      render(value, row) {
        return (
          <div className="flex flex-col gap-1">
            <div className="text-gray-900">{`$${value}`}</div>
            <div className="text-sm text-slate-600">{`${row.closedDeals} Deals closed`}</div>
          </div>
        );
      },
      width: "20%"
    }
  ];

  const tableData = companies.map((company: CrmCompanyMetricsType) => ({
    [companyTableColumns.NAME]: company.name,
    [companyTableColumns.CONTACT_NUMBER]: company.contactNumber ?? "-",
    [companyTableColumns.TASKS]: company.tasks ?? "-",
    [companyTableColumns.OPEN_VALUE]: company.openValue ?? "-",
    [companyTableColumns.ACCOUNT_VALUE]: company.accountValue ?? "-",
    [companyTableColumns.CLOSED_DEALS]: company.closedDeals ?? "-",
    [companyTableColumns.OVERDUE]: company.overdue ?? "-"
  }));

  const loadMore = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row gap-4 w-full h-[48px] items-center justify-between">
        <InputField
          ariaLabelClearButton={translateText([
            "table",
            "clearButtonAriaLabel"
          ])}
          className="w-[412px] h-[48px]"
          placeholder={translateText(["table", "search"])}
          rightIcon={<SearchIcon />}
          state="default"
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          customStyles={styles.searchInput}
        />
        <IconButton
          isRounded={true}
          variant="outlined"
          icon={<FilterIcon />}
          style={styles.filterButton}
          type="button"
          disabled
        />
      </div>

      <Table
        columns={columns as TableColumn<any>[]}
        data={tableData}
        emptyStateType={emptyStateType}
        isLoading={isLoading && companies.length === 0}
        customSkeletonLoader={<ProjectTableSkeletonLoader rowCount={8} />}
        height="35.3125rem"
        hasMore={hasNextPage}
        onRowClick={() => {
          return;
        }}
        onLoadMore={loadMore}
        infiniteScrollLoadingMessage={translateText([
          "table",
          "infiniteScrollLoadingMessage"
        ])}
        scrollThreshold={0.8}
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
      />
    </div>
  );
};
