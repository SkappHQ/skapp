import {
  Label,
  ProjectTableSkeletonLoader,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import TableView from "~community/common/components/organisms/TableView/TableView";
import type {
  GridHeader,
  GridRow
} from "~community/common/components/organisms/TableView/types";
import { SEARCH_DEBOUNCE_DELAY } from "~community/common/constants/commonConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetCompaniesInfinite } from "~community/crm/v2/api/CompanyApi";
import {
  COMPANY_PAGE_SIZE,
  PHONE_NUMBER_PREFIX
} from "~community/crm/v2/constants/commonConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  CrmCompanyFilterRequest,
  CrmSidePanelTypes
} from "~community/crm/v2/types/CrmTypes";
import {
  formatMonetaryValue,
  formatTableValue
} from "~community/crm/v2/utils/commonUtil";
import { normalizeCompanies } from "~community/crm/v2/utils/companyUtil";

export const CompanyTable: FC = () => {
  const translateText = useTranslator("crmModule", "companies");

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm.trim(), SEARCH_DEBOUNCE_DELAY);

  const {
    companies,
    companyIds,
    setCompanies,
    setCompanyIds,
    setSelectedCompanyId,
    openCrmSidePanel
  } = useCrmStoreV2(
    useShallow((store) => ({
      companies: store.companies,
      companyIds: store.companyIds,
      setCompanies: store.setCompanies,
      setCompanyIds: store.setCompanyIds,
      setSelectedCompanyId: store.setSelectedCompanyId,
      openCrmSidePanel: store.openCrmSidePanel
    }))
  );

  const companyFilters: CrmCompanyFilterRequest = {
    searchKeyword: debouncedSearch,
    size: COMPANY_PAGE_SIZE
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetCompaniesInfinite(companyFilters);

  const hasSearchTerm = debouncedSearch !== "";

  useEffect(() => {
    if (!data) return;

    const items = data.pages.flatMap((page) => page.items);
    const normalized = normalizeCompanies(items);

    setCompanies({ ...companies, ...normalized.companies });
    setCompanyIds(normalized.companyIds);
  }, [data]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  const tableHeaders: GridHeader[] = [
    {
      id: "name",
      label: translateText(["table", "columns", "nameHeader"]),
      width: "25%"
    },
    {
      id: "contactNumber",
      label: translateText(["table", "columns", "phoneHeader"]),
      width: "20%"
    },
    {
      id: "openTasksCount",
      label: translateText(["table", "columns", "tasksHeader"]),
      width: "15%"
    },
    {
      id: "openValue",
      label: translateText(["table", "columns", "pipelineHeader"]),
      width: "20%",
      align: "right"
    },
    {
      id: "accountValue",
      label: translateText(["table", "columns", "accountValueHeader"]),
      width: "20%",
      align: "right"
    }
  ];

  const transformToTableRows = (): GridRow[] =>
    companyIds.map((id) => {
      const company = companies[id];
      const metrics = company.metrics;

      return {
        id,
        ariaLabel: company.name,
        name: (
          <span className="body2 block w-full truncate" title={company.name}>
            {company.name}
          </span>
        ),
        contactNumber: (
          <div className="flex items-baseline">
            {formatTableValue(company.contactNumber, PHONE_NUMBER_PREFIX)}
          </div>
        ),
        openTasksCount: (
          <div className="flex flex-row items-center gap-2">
            {formatTableValue(metrics?.openTasksCount)}
            {metrics?.overdueTasksCount !== undefined &&
              metrics.overdueTasksCount > 0 && (
                <Label
                  backgroundColor="bg-semantic-red-background"
                  textColor="text-semantic-red-text"
                >
                  {`${metrics.overdueTasksCount} ${translateText(["table", "overdueLabel"])}`}
                </Label>
              )}
          </div>
        ),
        openValue: (
          <div className="flex justify-end">
            {formatMonetaryValue(metrics?.openValue)}
          </div>
        ),
        accountValue: (
          <div className="flex flex-col gap-1 text-right">
            <div>{formatMonetaryValue(metrics?.accountValue)}</div>
            <div className="subtitle4 text-secondary-text">
              {metrics?.closedDealsCount !== undefined &&
              metrics.closedDealsCount > 0
                ? `${metrics.closedDealsCount} ${translateText(["table", "closedDealsLabel"])}`
                : ""}
            </div>
          </div>
        )
      };
    });

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
        title: hasSearchTerm
          ? translateText(["table", "emptySearchState", "title"])
          : translateText(["table", "emptyDataState", "title"]),
        description: hasSearchTerm
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
          "aria-label": translateText(["table", "searchAriaLabel"]),
          ariaLabelClearButton: translateText(["table", "clearButtonAriaLabel"])
        }
      }}
      filter={{
        filterCount: 0,
        isDisabled: true,
        filterButtonAriaLabel: translateText([
          "table",
          "filterButtonAriaLabel"
        ]),
        popoverId: "crm-companies-filter"
      }}
    />
  );
};
