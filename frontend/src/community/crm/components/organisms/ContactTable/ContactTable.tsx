import { Label } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo, useState } from "react";

import type {
  GridHeader,
  GridRow
} from "~community/common/components/organisms/TableView/types";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetContactMetrics,
  useGetCrmCompanies
} from "~community/crm/api/ContactApi";
import OwnerAvatarChip from "~community/crm/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import CrmTableView from "~community/crm/components/organisms/CrmTableView/CrmTableView";
import {
  ALL_COMPANIES,
  CONTACT_SEARCH_DEBOUNCE_DELAY,
  DEFAULT_COMPANY_PAGE_SIZE,
  DEFAULT_PAGE_SIZE
} from "~community/crm/constants/contactConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import { formatValue } from "~community/crm/utils/crmUtil";
import {
  formatPhoneNumber,
  formatTasks
} from "~community/crm/utils/tableHelpers";

export const ContactTable: FC = () => {
  const translateText = useTranslator("crmModule", "contacts");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<number | undefined>(
    ALL_COMPANIES
  );
  const debouncedSearch = useDebounce(
    searchTerm,
    CONTACT_SEARCH_DEBOUNCE_DELAY
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetContactMetrics(debouncedSearch, DEFAULT_PAGE_SIZE, selectedCompany);

  const { data: companies } = useGetCrmCompanies(DEFAULT_COMPANY_PAGE_SIZE);

  const fetchedContacts = useMemo(
    () => data?.pages.flatMap((page) => page.items),
    [data]
  );

  const { contacts, setSelectedContactId, openCrmSidePanel, setContacts } =
    useCrmStore((store) => ({
      contacts: store.contacts,
      setSelectedContactId: store.setSelectedContactId,
      openCrmSidePanel: store.openCrmSidePanel,
      setContacts: store.setContacts
    }));

  useEffect(() => {
    if (fetchedContacts) setContacts(fetchedContacts);
  }, [fetchedContacts]);

  const hasActiveFilters =
    debouncedSearch.trim() !== "" || selectedCompany !== undefined;

  const companyOptions = [
    {
      id: "",
      label: translateText(["table", "companyFilter", "allCompanies"]),
      value: ""
    },
    ...(companies?.items ?? []).map((company) => ({
      id: String(company.id),
      label: company.name,
      value: String(company.id)
    }))
  ];

  const columns = [
    {
      field: "name",
      headerName: translateText(["table", "columns", "nameHeader"]),
      width: "17%"
    },
    {
      field: "email",
      headerName: translateText(["table", "columns", "emailHeader"]),
      width: "21%"
    },
    {
      field: "contactNumber",
      headerName: translateText(["table", "columns", "phoneHeader"]),
      width: "17%"
    },
    {
      field: "closedDealValue",
      headerName: translateText(["table", "columns", "closedValueHeader"]),
      width: "10%",
      align: "right" as const,
      className: "pr-[3%]"
    },
    {
      field: "openTasksCount",
      headerName: translateText(["table", "columns", "tasksHeader"]),
      width: "20%",
      className: "pl-[6%]"
    },
    {
      field: "owner",
      headerName: translateText(["table", "columns", "contactOwnerHeader"]),
      width: "15%"
    }
  ];

  const tableHeaders: GridHeader[] = columns.map((col) => ({
    id: col.field,
    label: col.headerName,
    width: col.width,
    align: col.align,
    className: col.className
  }));

  const transformToTableRows = (): GridRow[] =>
    (contacts ?? []).map((contact) => ({
      id: contact.id,
      ariaLabel: contact.name,
      name: (
        <div className="flex flex-col gap-1 min-w-0">
          <div className="w-full truncate" title={contact.name}>
            {contact.name}
          </div>
          <div
            className="subtitle4 text-secondary-text w-full truncate"
            title={contact.company?.name ?? undefined}
          >
            {contact.company?.name ?? "-"}
          </div>
        </div>
      ),
      email: (
        <div className="block w-full truncate" title={contact.email}>
          {contact.email}
        </div>
      ),
      contactNumber: (
        <div className="flex items-baseline">
          {formatPhoneNumber(contact.contactNumber)}
        </div>
      ),
      closedDealValue: (
        <div className="flex flex-col gap-1 text-right">
          <div>{formatValue(contact.closedDealValue?.toString() ?? null)}</div>
          <div className="subtitle4 text-secondary-text">
            {(contact.closedDealCount ?? 0) > 0
              ? `${contact.closedDealCount} ${translateText(["table", "closedDealsLabel"], { count: contact.closedDealCount })}`
              : ""}
          </div>
        </div>
      ),
      openTasksCount: (
        <div className="flex flex-row items-center gap-2">
          {formatTasks(contact.openTasksCount)}
          {(contact.overdueTasksCount ?? 0) > 0 && (
            <Label
              backgroundColor="bg-semantic-red-background"
              textColor="text-semantic-red-text"
            >
              {`${contact.overdueTasksCount} ${translateText(["table", "overdueLabel"])}`}
            </Label>
          )}
        </div>
      ),
      owner: (
        <OwnerAvatarChip
          id={`contact-${contact.id}-owner-${contact.owner.employeeId}`}
          owner={contact.owner}
          backgroundColor="bg-tertiary-background"
        />
      )
    }));

  const handleRowClick = (row: GridRow) => {
    setSelectedContactId(Number(row.id));
    openCrmSidePanel(CrmSidePanelTypes.CONTACT_SIDE_PANEL);
  };

  return (
    <CrmTableView
      headers={tableHeaders}
      rows={transformToTableRows()}
      isLoading={isLoading}
      hasActiveFilters={hasActiveFilters}
      translateText={translateText}
      scrollHeight="37.2rem"
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={() => {
        void fetchNextPage();
      }}
      onRowClick={handleRowClick}
      toolbar={{
        searchBar: {
          value: searchTerm,
          onChange: (event) => setSearchTerm(event.target.value),
          placeholder: translateText(["table", "search"]),
          "aria-label": translateText(["table", "search"]),
          ariaLabelClearButton: translateText(["table", "clearButtonAriaLabel"])
        },
        dropdown: {
          id: "crm-contacts-company-filter",
          options: companyOptions,
          value: String(selectedCompany ?? ""),
          onChange: (value) =>
            setSelectedCompany(value ? Number(value) : ALL_COMPANIES),
          width: "auto",
          menuWidth: "content",
          ariaLabel: translateText(["table", "companyFilter", "ariaLabel"])
        }
      }}
    />
  );
};
