import { Label } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";

import type {
  GridHeader,
  GridRow
} from "~community/common/components/organisms/TableView/types";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetCompanyMetrics } from "~community/crm/api/CompanyApi";
import CrmTableView from "~community/crm/components/organisms/CrmTableView/CrmTableView";
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
  const isEmptyFilterState = debouncedSearch.trim() !== "";

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
    <CrmTableView
      headers={tableHeaders}
      rows={transformToTableRows()}
      isLoading={isLoading}
      isEmptyFilterState={isEmptyFilterState}
      translateText={translateText}
      scrollHeight="34.5rem"
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={() => {
        void fetchNextPage();
      }}
      onRowClick={handleRowClick}
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
