import {
  Label,
  ProjectTableSkeletonLoader,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import TableView from "~community/common/components/organisms/TableView/TableView";
import type {
  GridHeader,
  GridRow
} from "~community/common/components/organisms/TableView/types";
import { SEARCH_DEBOUNCE_DELAY } from "~community/common/constants/commonConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetCompaniesByIds,
  useGetCompanyLookup
} from "~community/crm/v2/api/CompanyApi";
import { useGetContactsInfinite } from "~community/crm/v2/api/ContactApi";
import OwnerAvatarChip from "~community/crm/v2/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import {
  CONTACT_PAGE_SIZE,
  DEFAULT_LOOKUP_PAGE_SIZE
} from "~community/crm/v2/constants/commonConstants";
import { ALL_COMPANIES } from "~community/crm/v2/constants/contactConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  CrmCompanyFilterRequest,
  CrmContactFilterRequest,
  CrmSidePanelTypes
} from "~community/crm/v2/types/CrmTypes";
import {
  formatMonetaryValueWithDecimals,
  formatTableValue,
  getOwnerById
} from "~community/crm/v2/utils/commonUtil";
import {
  getCompanyNameById,
  getMissingCompanyIds,
  mergeCompanies
} from "~community/crm/v2/utils/companyUtil";
import {
  getContactCompanyIds,
  mergeContacts,
  toContactIds
} from "~community/crm/v2/utils/contactUtil";

interface ContactTableProps {
  initializeCrmData: boolean;
}

export const ContactTable: FC<ContactTableProps> = ({ initializeCrmData }) => {
  const translateText = useTranslator("crmModule", "contacts");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(ALL_COMPANIES);

  const debouncedSearch = useDebounce(searchTerm.trim(), SEARCH_DEBOUNCE_DELAY);

  const {
    contacts,
    contactIds,
    companies,
    owners,
    setContacts,
    setContactIds,
    setSelectedContactId,
    openCrmSidePanel,
    isCrmDataInitialized
  } = useCrmStoreV2(
    useShallow((store) => ({
      contacts: store.contacts,
      contactIds: store.contactIds,
      companies: store.companies,
      owners: store.owners,
      setContacts: store.setContacts,
      setContactIds: store.setContactIds,
      setSelectedContactId: store.setSelectedContactId,
      openCrmSidePanel: store.openCrmSidePanel,
      isCrmDataInitialized: store.isCrmDataInitialized
    }))
  );

  const contactFilters: CrmContactFilterRequest = {
    searchKeyword: debouncedSearch,
    size: CONTACT_PAGE_SIZE,
    companyId:
      selectedCompany === ALL_COMPANIES ? undefined : Number(selectedCompany)
  };

  const companyLookupFilters: CrmCompanyFilterRequest = {
    size: DEFAULT_LOOKUP_PAGE_SIZE
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isContactsLoading
  } = useGetContactsInfinite(contactFilters, isCrmDataInitialized);

  const { data: companyLookupData } = useGetCompanyLookup(companyLookupFilters);

  const fetchedContacts = useMemo(
    () => data?.pages.flatMap((page) => page.items),
    [data]
  );

  useEffect(() => {
    if (!fetchedContacts) return;

    setContacts(mergeContacts(contacts, fetchedContacts));
    setContactIds(toContactIds(fetchedContacts));
  }, [fetchedContacts]);

  const missingCompanyIds = useMemo(
    () =>
      getMissingCompanyIds(
        getContactCompanyIds(contacts, contactIds),
        companies
      ),
    [contacts, contactIds, companies]
  );

  const { data: fetchedCompanies } = useGetCompaniesByIds(
    missingCompanyIds,
    missingCompanyIds.length > 0
  );

  useEffect(() => {
    if (!fetchedCompanies) return;

    const store = useCrmStoreV2.getState();
    store.setCompanies(mergeCompanies(store.companies, fetchedCompanies));
  }, [fetchedCompanies]);

  useEffect(() => {
    if (!companyLookupData) return;

    const store = useCrmStoreV2.getState();
    store.setCompanies(
      mergeCompanies(store.companies, companyLookupData.items)
    );
  }, [companyLookupData]);

  const isEmptyFilterState =
    debouncedSearch !== "" || selectedCompany !== ALL_COMPANIES;

  const companyOptions = [
    {
      id: ALL_COMPANIES,
      label: translateText(["table", "companyFilter", "allCompanies"]),
      value: ALL_COMPANIES
    }
  ];

  if (companyLookupData) {
    for (const company of companyLookupData.items) {
      if (company.id !== undefined && company.name !== undefined) {
        companyOptions.push({
          id: String(company.id),
          label: company.name,
          value: String(company.id)
        });
      }
    }
  }

  const isLoading = isContactsLoading || initializeCrmData;

  const tableHeaders: GridHeader[] = [
    {
      id: "name",
      label: translateText(["table", "columns", "nameHeader"]),
      width: "25%"
    },
    {
      id: "email",
      label: translateText(["table", "columns", "emailHeader"]),
      width: "20%"
    },
    {
      id: "contactNumber",
      label: translateText(["table", "columns", "phoneHeader"]),
      width: "15%"
    },
    {
      id: "closedDealValue",
      label: translateText(["table", "columns", "closedValueHeader"]),
      width: "15%",
      align: "right"
    },
    {
      id: "openTasksCount",
      label: translateText(["table", "columns", "tasksHeader"]),
      width: "15%"
    },
    {
      id: "owner",
      label: translateText(["table", "columns", "contactOwnerHeader"]),
      width: "10%"
    }
  ];

  const transformToTableRows = (): GridRow[] =>
    contactIds.map((id) => {
      const contact = contacts[id];
      const metrics = contact.metrics;
      const companyName = getCompanyNameById(companies, contact.companyId);
      const owner = getOwnerById(owners, contact.ownerId);

      return {
        id,
        ariaLabel: contact.name,
        name: (
          <div className="flex flex-col gap-1 min-w-0">
            <div className="w-full truncate" title={contact.name}>
              {contact.name}
            </div>
            <div
              className="subtitle4 text-secondary-text w-full truncate"
              title={companyName}
            >
              {formatTableValue(companyName)}
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
            {formatTableValue(contact.contactNumber, "+")}
          </div>
        ),
        closedDealValue: (
          <div className="flex flex-col gap-1 text-right">
            <div>
              {formatMonetaryValueWithDecimals(metrics?.closedDealValue)}
            </div>
            <div className="subtitle4 text-secondary-text">
              {metrics?.closedDealCount !== undefined &&
              metrics.closedDealCount > 0
                ? `${metrics.closedDealCount} ${translateText(["table", "closedDealsLabel"], { count: metrics.closedDealCount })}`
                : ""}
            </div>
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
        owner: owner && (
          <OwnerAvatarChip
            id={`contact-${id}-owner-${owner.employeeId}`}
            owner={owner}
            backgroundColor="bg-tertiary-background"
          />
        )
      };
    });

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRowClick = (row: GridRow) => {
    setSelectedContactId(Number(row.id));
    openCrmSidePanel(CrmSidePanelTypes.CONTACT_SIDE_PANEL);
  };

  return (
    <TableView
      headers={tableHeaders}
      rows={transformToTableRows()}
      isLoading={isLoading}
      loader={<ProjectTableSkeletonLoader rowCount={8} />}
      emptyState={{
        icon: <SearchIcon />,
        title: isEmptyFilterState
          ? translateText(["table", "emptySearchState", "title"])
          : translateText(["table", "emptyDataState", "title"]),
        description: isEmptyFilterState
          ? translateText(["table", "emptySearchState", "description"])
          : translateText(["table", "emptyDataState", "description"])
      }}
      onRowClick={handleRowClick}
      infiniteScroll={{
        isEnabled: true,
        height: "37.2rem",
        hasMore: hasNextPage,
        isFetchingNextPage,
        onLoadMore: fetchNextPage
      }}
      toolbar={{
        searchBar: {
          value: searchTerm,
          onChange: handleSearchChange,
          placeholder: translateText(["table", "search"]),
          "aria-label": translateText(["table", "search"]),
          ariaLabelClearButton: translateText(["table", "clearButtonAriaLabel"])
        },
        dropdown: {
          id: "crm-contacts-company-filter",
          options: companyOptions,
          value: selectedCompany,
          onChange: (value) => setSelectedCompany(value),
          width: "auto",
          menuWidth: "content",
          ariaLabel: translateText(["table", "companyFilter", "ariaLabel"])
        }
      }}
    />
  );
};
