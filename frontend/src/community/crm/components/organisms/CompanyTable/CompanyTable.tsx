import {
  Label,
  ProjectTableSkeletonLoader,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";

import TableView from "~community/common/components/organisms/TableView/TableView";
import type {
  GridHeader,
  GridRow
} from "~community/common/components/organisms/TableView/types";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetCompanyMetrics } from "~community/crm/api/CompanyApi";
import {
  COMPANY_NAME_DEBOUNCE_DELAY,
  DEFAULT_PAGE_SIZE
} from "~community/crm/constants/companyConstants";
import { useCrmStore } from "~community/crm/store/store";
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
  const hasActiveFilters = debouncedSearch.trim() !== "";

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
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

  const columns = [
    {
      field: "name",
      headerName: translateText(["table", "columns", "nameHeader"]),
      width: "25%"
    },
    {
      field: "contactNumber",
      headerName: translateText(["table", "columns", "phoneHeader"]),
      width: "20%"
    },
    {
      field: "openTasksCount",
      headerName: translateText(["table", "columns", "tasksHeader"]),
      width: "15%"
    },
    {
      field: "openValue",
      headerName: translateText(["table", "columns", "pipelineHeader"]),
      width: "20%",
      align: "right" as const
    },
    {
      field: "accountValue",
      headerName: translateText(["table", "columns", "accountValueHeader"]),
      width: "20%",
      align: "right" as const
    }
  ];

  const tableHeaders: GridHeader[] = columns.map((col) => ({
    id: col.field,
    label: col.headerName,
    width: col.width,
    align: col.align
  }));

  const transformToTableRows = (): GridRow[] =>
    (companies ?? []).map((company) => ({
      id: company.id,
      ariaLabel: company.name,
      name: (
        <span className="body2 block w-full truncate" title={company.name}>
          {company.name}
        </span>
      ),
      contactNumber: (
        <div className="flex items-baseline">
          {formatPhoneNumber(company.contactNumber)}
        </div>
      ),
      openTasksCount: (
        <div className="flex flex-row items-center gap-2">
          {formatTasks(company.openTasksCount)}
          {(company.overdue ?? 0) > 0 && (
            <Label
              backgroundColor="bg-semantic-red-background"
              textColor="text-semantic-red-text"
            >
              {`${company.overdue} ${translateText(["table", "overdueLabel"])}`}
            </Label>
          )}
        </div>
      ),
      openValue: (
        <div className="flex justify-end">
          {formatMonetaryValue(company.openValue)}
        </div>
      ),
      accountValue: (
        <div className="flex flex-col gap-1 text-right">
          <div>{formatMonetaryValue(company.accountValue)}</div>
          <div className="subtitle4 text-secondary-text">
            {(company.closedDeals ?? 0) > 0
              ? `${company.closedDeals} ${translateText(["table", "closedDealsLabel"])}`
              : ""}
          </div>
        </div>
      )
    }));

  const handleRowClick = (row: GridRow) => {
    setSelectedCompanyId(Number(row.id));
    openCrmSidePanel(CrmSidePanelTypes.COMPANY_SIDE_PANEL);
  };

  return (
    <TableView
      headers={tableHeaders}
      rows={transformToTableRows()}
      isLoading={isLoading}
      loader={<ProjectTableSkeletonLoader rowCount={8} />}
      emptyState={{
        icon: <SearchIcon />,
        title: hasActiveFilters
          ? translateText(["table", "emptySearchState", "title"])
          : translateText(["table", "emptyDataState", "title"]),
        description: hasActiveFilters
          ? translateText(["table", "emptySearchState", "description"])
          : translateText(["table", "emptyDataState", "description"])
      }}
      onRowClick={handleRowClick}
      infiniteScroll={{
        isEnabled: true,
        height: "34.5rem",
        hasMore: hasNextPage,
        isFetchingNextPage,
        onLoadMore: () => {
          void fetchNextPage();
        }
      }}
      toolbar={{
        searchBar: {
          value: searchTerm,
          onChange: handleSearchChange,
          placeholder: translateText(["table", "search"]),
          "aria-label": translateText(["table", "search"]),
          ariaLabelClearButton: translateText(["table", "clearButtonAriaLabel"])
        }
      }}
      filter={{
        filterCount: 0,
        isDisabled: true,
        filterButtonAriaLabel: translateText(["table", "filterButtonAriaLabel"])
      }}
    />
  );
};
