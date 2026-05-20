import {
  FilterIcon,
  IconButton,
  InputField,
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
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";
import {
  formatAccountValue,
  formatCurrency,
  formatPhoneNumber,
  formatTasks
} from "~community/crm/utils/companyTableHelpers";

import styles from "./styles";

export const CompanyTable: React.FC = () => {
  const translateText = useTranslator("crmModule", "companies");

  const { setSelectedCompany, setIsCompanyDetailDrawerOpen } = useCrmStore(
    (store) => ({
      setSelectedCompany: store.setSelectedCompany,
      setIsCompanyDetailDrawerOpen: store.setIsCompanyDetailDrawerOpen
    })
  );

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

  const handleRowClick = (
    _row: Record<string, unknown>,
    index: number
  ): void => {
    const company = companies[index];
    if (!company) return;

    setSelectedCompany({
      id: company.id,
      name: company.name,
      industry: company.industry,
      website: company.website ?? "",
      address: company.address ?? "",
      contactNumber: company.contactNumber ? `+${company.contactNumber}` : "",
      tasks: company.tasks ?? 0,
      overdue: company.overdue ?? 0,
      openValue: company.openValue ?? 0,
      accountValue: company.accountValue ?? 0,
      closedDeals: company.closedDeals ?? 0,
      openDeals: company.openDeals ?? 0
    });
    setIsCompanyDetailDrawerOpen(true);
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
      render(value) {
        return formatPhoneNumber(value);
      },
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "tasksAriaLabel"]),
      header: translateText(["table", "columns", "tasksHeader"]),
      key: companyTableColumns.TASKS,
      render(value, row) {
        return formatTasks(value, row);
      },
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "pipelineAriaLabel"]),
      header: translateText(["table", "columns", "pipelineHeader"]),
      key: companyTableColumns.OPEN_VALUE,
      render(openValue) {
        return formatCurrency(openValue);
      },
      className: "justify-end text-right",
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
        return formatAccountValue(value, row);
      },
      className: "justify-end text-right",
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
          style={styles.filterButton}
          type="button"
          aria-label={translateText(["table", "filterButtonAriaLabel"])}
          disabled
        />
      </div>

      <Table
        columns={columns as TableColumn<any>[]}
        data={companies}
        emptyStateType={emptyStateType}
        isLoading={isLoading && companies.length === 0}
        customSkeletonLoader={<ProjectTableSkeletonLoader rowCount={8} />}
        height="33rem"
        hasMore={hasNextPage}
        onRowClick={handleRowClick}
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
