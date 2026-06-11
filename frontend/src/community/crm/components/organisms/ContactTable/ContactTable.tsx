import {
  AvatarChip,
  Dropdown,
  InputField,
  Label,
  ProjectTableSkeletonLoader,
  SearchIcon,
  Table,
  TableColumn
} from "@rootcodelabs/skapp-ui";
import { useState } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { concatStrings } from "~community/common/utils/commonUtil";
import {
  useGetContactMetrics,
  useGetCrmCompanies
} from "~community/crm/api/ContactApi";
import {
  ALL_COMPANIES,
  CONTACT_SEARCH_DEBOUNCE_DELAY,
  DEFAULT_COMPANY_PAGE_SIZE,
  DEFAULT_PAGE_SIZE
} from "~community/crm/constants/contactConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmContactMetricsType } from "~community/crm/types/CommonTypes";
import { formatMonetaryValue } from "~community/crm/utils/commonHelpers";
import {
  formatPhoneNumber,
  formatTasks
} from "~community/crm/utils/tableHelpers";

export const ContactTable: React.FC = () => {
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

  const contacts = data?.pages.flatMap((page) => page.items);

  const { setSelectedContact, setIsContactSidePanelOpen } = useCrmStore(
    (store) => ({
      setSelectedContact: store.setSelectedContact,
      setIsContactSidePanelOpen: store.setIsContactSidePanelOpen
    })
  );

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

  const columns: TableColumn<CrmContactMetricsType>[] = [
    {
      columnAriaLabel: translateText(["table", "columns", "nameAriaLabel"]),
      header: translateText(["table", "columns", "nameHeader"]),
      key: "name",
      render(value, row) {
        return (
          <div className="flex flex-col gap-1">
            <div>{value}</div>
            <div className="subtitle4 text-secondary-text">
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
      render(value, row) {
        return (
          <div className="flex flex-col gap-1 text-right">
            <div>{formatMonetaryValue(value)}</div>
            <div className="subtitle4 text-secondary-text">
              {row.closedDealCount > 0
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
      key: "openTaskCount",
      render(value, row) {
        return (
          <div className="flex flex-row items-center gap-2">
            {formatTasks(value)}
            {row.overdueTaskCount > 0 && (
              <Label
                backgroundColor="bg-semantic-red-background"
                textColor="text-semantic-red-text"
              >
                {`${row.overdueTaskCount} ${translateText(["table", "overdueLabel"])}`}
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
        const { owner } = row;
        return (
          <AvatarChip
            avatarProps={{
              id: `contact-${row.id}-owner-${owner?.employeeId}`,
              src: owner?.authPic ?? undefined,
              firstName: owner?.firstName,
              lastName: owner?.lastName ?? ""
            }}
            label={concatStrings([owner?.firstName, owner?.lastName ?? ""])}
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
          setSelectedContact(row);
          setIsContactSidePanelOpen(true);
        }}
      />
    </div>
  );
};
