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
import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";
import {
  formatValue,
  formatPhoneNumber,
  formatTasks
} from "~community/crm/utils/companyTableHelpers";
import { COMPANY_NAME_DEBOUNCE_DELAY, DEFAULT_PAGE_SIZE } from "~community/crm/constants/companyConstants";
import { useCrmStore } from "~community/crm/store/store";

export const CompanyTable: React.FC = () => {
  const translateText = useTranslator("crmModule", "companies");

  const { setSelectedCompany, setIsCompanyDetailDrawerOpen } = useCrmStore(
    (store) => ({
      setSelectedCompany: store.setSelectedCompany,
      setIsCompanyDetailDrawerOpen: store.setIsCompanyDetailDrawerOpen
    })
  );

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, COMPANY_NAME_DEBOUNCE_DELAY);
  const emptyStateType =
    debouncedSearch.trim() === ""
      ? EmptyStateTypeEnum.NO_DATA
      : EmptyStateTypeEnum.NO_SEARCH_RESULTS;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetCompanyMetrics(debouncedSearch, DEFAULT_PAGE_SIZE);

  const companies = useMemo(() => {
    const apiData = data?.pages.flatMap((page) => page?.items ?? []);
    if (apiData && apiData.length > 0) return apiData;
    return [
      {
        id: 1,
        name: "Acme Corporation",
        contactNumber: "14155551234",
        industry: "Manufacturing",
        website: "https://acme.com",
        address: "123 Main St, San Francisco, CA",
        tasks: 8,
        overdue: 2,
        openValue: 45000,
        accountValue: 120000,
        closedDeals: 5,
        openDeals: 3
      },
      {
        id: 2,
        name: "Stark Industries",
        contactNumber: "12129876543",
        industry: "Technology",
        website: "https://starkindustries.com",
        address: "200 Park Ave, New York, NY",
        tasks: 12,
        overdue: 0,
        openValue: 85000,
        accountValue: 250000,
        closedDeals: 8,
        openDeals: 4
      },
      {
        id: 3,
        name: "Globex Corp",
        contactNumber: "442071234567",
        industry: "Finance",
        website: "https://globex.com",
        address: "10 Downing St, London, UK",
        tasks: 5,
        overdue: 1,
        openValue: 32000,
        accountValue: 75000,
        closedDeals: 6,
        openDeals: 2
      },
      {
        id: 4,
        name: "Initech",
        contactNumber: "14159876543",
        industry: "Software",
        website: "https://initech.com",
        address: "456 Tech Blvd, Austin, TX",
        tasks: 15,
        overdue: 4,
        openValue: 62000,
        accountValue: 180000,
        closedDeals: 10,
        openDeals: 5
      },
      {
        id: 5,
        name: "Wayne Enterprises",
        contactNumber: "13125559876",
        industry: "Conglomerate",
        website: "https://wayne.com",
        address: "1007 Mountain Dr, Gotham",
        tasks: 3,
        overdue: 0,
        openValue: 95000,
        accountValue: 310000,
        closedDeals: 12,
        openDeals: 2
      }
    ] as CrmCompanyMetricsType[];
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
      key: "name",
      width: "25%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "phoneAriaLabel"]),
      header: translateText(["table", "columns", "phoneHeader"]),
      key: "contactNumber",
      render(value) {
        return <div className="flex items-baseline">{formatPhoneNumber(value)}</div>;
      },
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "tasksAriaLabel"]),
      header: translateText(["table", "columns", "tasksHeader"]),
      key: "tasks",
      render(value, row) {
        return (
          <div className="flex flex-row items-center gap-2">
            {formatTasks(value)}
            {row.overdue > 0 && (
              <Label
                backgroundColor="bg-semantic-red-background"
                textColor="text-semantic-red-text"
              >{`${row.overdue} ${translateText(["table", "overdueLabel"])}`}
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
      render(openValue) {
        return (<div className="flex justify-end" >{formatValue(openValue)}</div>);
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
      render(value, row) {
        return (
          <div className="flex flex-col gap-1 text-right">
            <div>{formatValue(value)}</div>
            <div className="subtitle4 text-secondary-text" >
              {row.closedDeals > 0 ? `${row.closedDeals} ${translateText(["table", "closedDealsLabel"])}` : ""}
            </div>
          </div>)
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
        isLoading={isLoading && companies?.length === 0}
        customSkeletonLoader={<ProjectTableSkeletonLoader rowCount={8} />}
        height="34.5rem"
        hasMore={hasNextPage}
        onLoadMore={loadMore}
        onRowClick={handleRowClick}
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
      />
    </div>
  );
};
