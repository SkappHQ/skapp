import {
  Dropdown,
  InputField,
  Label,
  ProjectTableSkeletonLoader,
  SearchIcon,
  Table,
  TableColumn
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo, useState } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetContactMetrics,
  useGetCrmCompanies
} from "~community/crm/api/ContactApi";
import OwnerAvatarChip from "~community/crm/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import {
  ALL_COMPANIES,
  CONTACT_SEARCH_DEBOUNCE_DELAY,
  DEFAULT_COMPANY_PAGE_SIZE,
  DEFAULT_PAGE_SIZE
} from "~community/crm/constants/contactConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmContact } from "~community/crm/types/CommonTypes";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import { getContactFullName } from "~community/crm/utils/contactUtil";
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
  const emptyStateType = hasActiveFilters
    ? EmptyStateTypeEnum.NO_SEARCH_RESULTS
    : EmptyStateTypeEnum.NO_DATA;

  const companyOptions = [
    {
      id: ALL_COMPANIES,
      label: translateText(["table", "companyFilter", "allCompanies"]),
      value: ALL_COMPANIES
    },
    ...(companies?.items ?? []).map((company) => ({
      id: String(company.id),
      label: company.name,
      value: company.id
    }))
  ];

  const columns: TableColumn<CrmContact>[] = [
    {
      columnAriaLabel: translateText(["table", "columns", "nameAriaLabel"]),
      header: translateText(["table", "columns", "nameHeader"]),
      key: "firstName",
      render(_value, row) {
        const contactFullName = getContactFullName(row);
        return (
          <div className="flex flex-col gap-1 min-w-0">
            <div className="w-full truncate" title={contactFullName}>
              {contactFullName}
            </div>
            <div
              className="subtitle4 text-secondary-text w-full truncate"
              title={row.company?.name ?? undefined}
            >
              {row.company?.name ?? "-"}
            </div>
          </div>
        );
      },
      width: "17%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "emailAriaLabel"]),
      header: translateText(["table", "columns", "emailHeader"]),
      key: "email",
      render(value) {
        return (
          <div className="block w-full truncate" title={value}>
            {value}
          </div>
        );
      },
      width: "21%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "phoneAriaLabel"]),
      header: translateText(["table", "columns", "phoneHeader"]),
      key: "contactNumber",
      render(value) {
        return (
          <div className="flex items-baseline">
            {formatPhoneNumber(value as string | null)}
          </div>
        );
      },
      width: "17%"
    },
    {
      columnAriaLabel: translateText([
        "table",
        "columns",
        "closedValueAriaLabel"
      ]),
      header: translateText(["table", "columns", "closedValueHeader"]),
      key: "closedDealValue",
      render(_value, row) {
        return (
          <div className="flex flex-col gap-1 text-right">
            <div>{formatValue(row.closedDealValue?.toString() ?? null)}</div>
            <div className="subtitle4 text-secondary-text">
              {(row.closedDealCount ?? 0) > 0
                ? `${row.closedDealCount} ${translateText(["table", "closedDealsLabel"], { count: row.closedDealCount })}`
                : ""}
            </div>
          </div>
        );
      },
      className: "text-right pr-[3%]",
      width: "10%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "tasksAriaLabel"]),
      header: translateText(["table", "columns", "tasksHeader"]),
      key: "openTasksCount",
      render(_value, row) {
        return (
          <div className="flex flex-row items-center gap-2">
            {formatTasks(row.openTasksCount)}
            {(row.overdueTasksCount ?? 0) > 0 && (
              <Label
                backgroundColor="bg-semantic-red-background"
                textColor="text-semantic-red-text"
              >
                {`${row.overdueTasksCount} ${translateText(["table", "overdueLabel"])}`}
              </Label>
            )}
          </div>
        );
      },
      className: "pl-[6%]",
      width: "20%"
    },
    {
      columnAriaLabel: translateText([
        "table",
        "columns",
        "contactOwnerAriaLabel"
      ]),
      header: translateText(["table", "columns", "contactOwnerHeader"]),
      key: "owner",
      render(_, row) {
        return (
          <OwnerAvatarChip
            id={`contact-${row.id}-owner-${row.owner.employeeId}`}
            owner={row.owner}
            backgroundColor="bg-tertiary-background"
          />
        );
      },
      width: "15%"
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
          onChange={(event) => setSearchTerm(event.target.value)}
          customStyles={{ borderRadius: "rounded-[1.5rem]" }}
        />
        <Dropdown
          ariaLabel={translateText(["table", "companyFilter", "ariaLabel"])}
          className="rounded-full"
          menuWidth="content"
          options={companyOptions}
          value={selectedCompany}
          variant="secondary"
          onChange={(value) => setSelectedCompany(value)}
        />
      </div>

      <Table
        columns={columns as TableColumn<any>[]}
        data={contacts ?? []}
        emptyStateType={emptyStateType}
        isLoading={isLoading}
        customSkeletonLoader={<ProjectTableSkeletonLoader rowCount={8} />}
        height="37.2rem"
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
          setSelectedContactId(row.id);
          openCrmSidePanel(CrmSidePanelTypes.CONTACT_SIDE_PANEL);
        }}
      />
    </div>
  );
};
