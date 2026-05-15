import {
  EmptyStateType,
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
import { useGetCompanyTableData } from "~community/crm/api/CompanyApi";
import { EmptyStateTypeEnum } from "~community/crm/enums/CrmCompanyEnums";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyTableDataType } from "~community/crm/types/CommonTypes";

export const CompanyTable: React.FC = () => {
  const translateText = useTranslator("crmModule", "companies");

  const { setSelectedCompany, setIsCompanyDetailDrawerOpen } = useCrmStore(
    (store) => ({
      setSelectedCompany: store.setSelectedCompany,
      setIsCompanyDetailDrawerOpen: store.setIsCompanyDetailDrawerOpen
    })
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [emptyStateType, setEmptyStateType] = useState<EmptyStateType>(
    EmptyStateTypeEnum.NO_DATA
  );

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetCompanyTableData(debouncedSearch, 12);

  const companies = useMemo(() => {
    return data?.pages.flatMap((page) => page?.items ?? []) ?? [];
  }, [data]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setEmptyStateType(
      value.trim() === ""
        ? EmptyStateTypeEnum.NO_DATA
        : EmptyStateTypeEnum.NO_SEARCH_RESULTS
    );
  };

  const columns: TableColumn<CrmCompanyTableDataType>[] = [
    {
      columnAriaLabel: translateText(["table", "columns", "nameAriaLabel"]),
      header: translateText(["table", "columns", "nameHeader"]),
      key: "name",
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "phoneAriaLabel"]),
      header: translateText(["table", "columns", "phoneHeader"]),
      key: "contactNumber",
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "tasksAriaLabel"]),
      header: translateText(["table", "columns", "tasksHeader"]),
      key: "tasks",
      render(value, row) {
        if (value === 0) return;
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
      key: "openValue",
      render(value) {
        if (value === 0 || value === "-") return "-";
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
      key: "accountValue",
      render(value, row) {
        if (value === "-") return "-";
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

  const tableData = companies.map((company: CrmCompanyTableDataType) => ({
    id: company.id,
    name: company.name,
    contactNumber: company.contactNumber ? `+${company.contactNumber}` : "-",
    tasks: company.tasks ? company.tasks : "-",
    openValue: company.openValue ? company.openValue : "-",
    accountValue: company.accountValue ? company.accountValue : "-",
    closedDeals: company.closedDeals ? company.closedDeals : "-",
    overdue: company.overdue ? company.overdue : "-"
  }));

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
      contactNumber: company.contactNumber ? `+${company.contactNumber}` : "-",
      tasks: company.tasks ?? 0,
      overdue: company.overdue ?? 0,
      openValue: company.openValue ?? 0,
      accountValue: company.accountValue ?? 0,
      closedDeals: company.closedDeals ?? 0,
      openDeals: company.openDeals ?? 0
    });
    setIsCompanyDetailDrawerOpen(true);
  };

  const loadMore = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row gap-4 w-full items-center justify-between">
        <InputField
          ariaLabelClearButton={translateText([
            "table",
            "clearButtonAriaLabel"
          ])}
          className="w-1/3"
          placeholder={translateText(["table", "search"])}
          rightIcon={<SearchIcon />}
          state="default"
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          customStyles={{ borderRadius: "rounded-full" }}
        />
        <IconButton
          isRounded={true}
          variant="outlined"
          icon={<FilterIcon />}
          style={{ width: "3.4rem", height: "2.75rem" }}
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
