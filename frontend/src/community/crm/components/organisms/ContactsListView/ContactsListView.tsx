import {
  AvatarChip,
  Dropdown,
  InputField,
  Label,
  SearchIcon,
  Table
} from "@rootcodelabs/skapp-ui";
import type { TableColumn, TableRowType } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, useCallback, useMemo, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetCrmCompanies,
  useGetCrmContactsInfinite
} from "~community/crm/api/CrmContactsApi";
import { useCrmStore } from "~community/crm/store/store";
import { ContactListItem } from "~community/crm/types/CommonTypes";

interface ContactTableRow extends TableRowType {
  id: string;
  contact: {
    name: string;
    company: string;
  };
  email: string;
  contactNumber: string;
  dealValue: {
    value: string;
    closedDeals: string;
  };
  openTasks: {
    count: number;
    overdue?: string;
  };
  owner: {
    firstName: string;
    lastName: string;
    authPic?: string | null;
  };
}

const formatCurrency = (value: number): string => {
  return `$${Math.round(value)}`;
};

const mapContactToTableRow = (contact: ContactListItem): ContactTableRow => ({
  id: String(contact.id),
  contact: {
    name: contact.name,
    company: contact.company?.name ?? "—"
  },
  email: contact.email,
  contactNumber: contact.contactNumber ?? "—",
  dealValue: {
    value: formatCurrency(contact.closedDealValue),
    closedDeals: `${contact.closedDealCount} Deal${contact.closedDealCount !== 1 ? "s" : ""} closed`
  },
  openTasks: {
    count: contact.openTaskCount,
    overdue:
      contact.overdueTaskCount > 0
        ? `${contact.overdueTaskCount} overdue`
        : undefined
  },
  owner: {
    firstName: contact.owner.firstName,
    lastName: contact.owner.lastName,
    authPic: contact.owner.authPic
  }
});

const ContactNameCell = ({
  contact
}: {
  contact: ContactTableRow["contact"];
}) => (
  <div className="flex flex-col">
    <span className="body2 text-black">{contact.name}</span>
    <span className="text-xs text-secondary-text">{contact.company}</span>
  </div>
);

const DealValueCell = ({
  dealValue
}: {
  dealValue: ContactTableRow["dealValue"];
}) => (
  <div className="flex flex-col">
    <span className="body2 text-black">{dealValue.value}</span>
    <span className="text-xs text-secondary-text">{dealValue.closedDeals}</span>
  </div>
);

const OpenTasksCell = ({
  openTasks
}: {
  openTasks: ContactTableRow["openTasks"];
}) => (
  <div className="flex items-center gap-1">
    <span className="body2 text-black">{openTasks.count}</span>
    {openTasks.overdue && (
      <Label
        backgroundColor="bg-semantic-red-background"
        textColor="text-semantic-red-text"
      >
        {openTasks.overdue}
      </Label>
    )}
  </div>
);

const OwnerCell = ({ owner }: { owner: ContactTableRow["owner"] }) => (
  <AvatarChip
    avatarProps={{
      id: `owner-${owner.firstName}-${owner.lastName}`,
      src: owner.authPic ?? undefined,
      firstName: owner.firstName,
      lastName: owner.lastName
    }}
    label={`${owner.firstName} ${owner.lastName}`}
    backgroundColor="bg-zinc-100"
    className="max-w-full"
  />
);

const ContactsListView = () => {
  const translateText = useTranslator("crmModule", "contacts");
  const { openContactDetailPanel } = useCrmStore((state) => state);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");

  // Fetch companies for filter dropdown
  const { data: companiesData } = useGetCrmCompanies({ page: 0, size: 100 });

  // Build company IDs filter string
  const companyIds = useMemo(() => {
    if (selectedCompany === "all") return undefined;
    return selectedCompany;
  }, [selectedCompany]);

  // Fetch contacts with infinite scroll
  const {
    data: contactsData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useGetCrmContactsInfinite({
    size: 10,
    sortKey: "DEAL_VALUE",
    sortOrder: "DESC",
    searchKeyword: searchTerm.trim() || undefined,
    companyIds
  });

  const handleLoadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const companyOptions = useMemo(
    () => [
      {
        id: "all",
        label: translateText(["companyFilter", "allCompanies"]),
        value: "all"
      },
      ...(companiesData?.items ?? []).map((company) => ({
        id: String(company.id),
        label: company.name,
        value: String(company.id)
      }))
    ],
    [companiesData, translateText]
  );

  const tableData = useMemo(() => {
    const allItems = contactsData?.pages.flatMap((page) => page?.items ?? []) ?? [];
    return allItems.map(mapContactToTableRow);
  }, [contactsData]);

  const emptyStateType =
    searchTerm.trim() || selectedCompany !== "all"
      ? "no-search-results"
      : "no-data";

  const columns: TableColumn<ContactTableRow>[] = [
    {
      columnAriaLabel: translateText(["table", "columns", "contact"]),
      header: translateText(["table", "columns", "contact"]),
      key: "contact",
      render: (value) => (
        <ContactNameCell contact={value as ContactTableRow["contact"]} />
      ),
      width: "17%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "email"]),
      header: translateText(["table", "columns", "email"]),
      key: "email",
      render: (value) => (
        <span className="body2 truncate text-black">{value as string}</span>
      ),
      width: "21%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "contactNo"]),
      header: translateText(["table", "columns", "contactNo"]),
      key: "contactNumber",
      render: (value) => (
        <span className="body2 truncate text-black">{value as string}</span>
      ),
      width: "17%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "dealValue"]),
      header: translateText(["table", "columns", "dealValue"]),
      key: "dealValue",
      render: (value) => (
        <DealValueCell dealValue={value as ContactTableRow["dealValue"]} />
      ),
      width: "17%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "openTasks"]),
      header: translateText(["table", "columns", "openTasks"]),
      key: "openTasks",
      render: (value) => (
        <OpenTasksCell openTasks={value as ContactTableRow["openTasks"]} />
      ),
      width: "13%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "contactOwner"]),
      header: translateText(["table", "columns", "contactOwner"]),
      key: "owner",
      render: (value) => (
        <OwnerCell owner={value as ContactTableRow["owner"]} />
      ),
      width: "15%"
    }
  ];

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRowClick = (row: ContactTableRow) => {
    openContactDetailPanel(Number(row.id));
  };

  return (
    <>
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <InputField
            aria-label={translateText(["search", "ariaLabel"])}
            ariaLabelClearButton={translateText(["search", "clearAriaLabel"])}
            className="w-full max-w-[26rem]"
            customStyles={{
              borderRadius: "rounded-full"
            }}
            placeholder={translateText(["search", "placeholder"])}
            rightIcon={<SearchIcon width={16} height={16} />}
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Dropdown
            ariaLabel={translateText(["companyFilter", "ariaLabel"])}
            className="rounded-full"
            id="contact-company-filter"
            menuWidth="content"
            options={companyOptions}
            value={selectedCompany}
            variant="secondary"
            onChange={(value) => setSelectedCompany(value)}
          />
        </div>

        <Table
          columns={columns}
          data={tableData}
          emptyStateType={emptyStateType}
          generateRowAriaLabel={(row) =>
            translateText(["table", "rowAriaLabel"], {
              name: row.contact.name
            })
          }
          hasMore={hasNextPage}
          height="35rem"
          isLoading={isLoading || isFetchingNextPage}
          infiniteScrollLoadingMessage={translateText(["table", "loadingMore"])}
          scrollThreshold={0.8}
          onLoadMore={handleLoadMore}
          noDataState={{
            description: translateText([
              "emptyStates",
              "noContactsDescription"
            ]),
            icon: <SearchIcon />,
            title: translateText(["emptyStates", "noContactsTitle"])
          }}
          noSearchResultsState={{
            description: translateText(["emptyStates", "noResultsDescription"]),
            icon: <SearchIcon />,
            title: translateText(["emptyStates", "noResultsTitle"])
          }}
          tableAriaDescription={translateText(["table", "ariaDescription"])}
          tableAriaLabel={translateText(["table", "ariaLabel"])}
          onRowClick={handleRowClick}
        />
      </div>
    </>
  );
};

export default ContactsListView;
