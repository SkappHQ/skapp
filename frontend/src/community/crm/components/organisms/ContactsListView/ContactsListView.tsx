import { Avatar, Box, Typography } from "@mui/material";
import {
  Dropdown,
  InputField,
  SearchIcon,
  Table
} from "@rootcodelabs/skapp-ui";
import type { TableColumn, TableRowType } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, useMemo, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetCrmCompanies,
  useGetCrmContacts
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
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}m`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `$${value.toFixed(0)}`;
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

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`;

const ContactNameCell = ({
  contact
}: {
  contact: ContactTableRow["contact"];
}) => (
  <Box display="flex" flexDirection="column">
    <Typography variant="body2" color="common.black">
      {contact.name}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {contact.company}
    </Typography>
  </Box>
);

const DealValueCell = ({
  dealValue
}: {
  dealValue: ContactTableRow["dealValue"];
}) => (
  <Box display="flex" flexDirection="column">
    <Typography variant="body2" color="common.black">
      {dealValue.value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {dealValue.closedDeals}
    </Typography>
  </Box>
);

const OpenTasksCell = ({
  openTasks
}: {
  openTasks: ContactTableRow["openTasks"];
}) => (
  <Box display="flex" alignItems="center" gap={1}>
    <Typography variant="body2" color="common.black">
      {openTasks.count}
    </Typography>
    {openTasks.overdue && (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
        {openTasks.overdue}
      </span>
    )}
  </Box>
);

const OwnerCell = ({ owner }: { owner: ContactTableRow["owner"] }) => (
  <Box
    display="inline-flex"
    alignItems="center"
    gap={1}
    sx={{
      backgroundColor: "grey.100",
      borderRadius: "2rem",
      minHeight: "2.25rem",
      maxWidth: "100%",
      padding: "0.125rem 0.875rem 0.125rem 0.125rem"
    }}
  >
    <Avatar
      src={owner.authPic ?? undefined}
      sx={{
        bgcolor: "secondary.main",
        color: "primary.dark",
        fontSize: "0.75rem",
        height: "2rem",
        width: "2rem"
      }}
    >
      {getInitials(owner.firstName, owner.lastName)}
    </Avatar>
    <Typography
      variant="body2"
      color="common.black"
      noWrap
    >{`${owner.firstName} ${owner.lastName}`}</Typography>
  </Box>
);

const ContactsListView = () => {
  const translateText = useTranslator("crmModule", "contacts");
  const { openContactSidePanel } = useCrmStore((state) => state);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");

  // Fetch companies for filter dropdown
  const { data: companiesData } = useGetCrmCompanies({ page: 0, size: 100 });

  // Build company IDs filter string
  const companyIds = useMemo(() => {
    if (selectedCompany === "all") return undefined;
    return selectedCompany;
  }, [selectedCompany]);

  // Fetch contacts with search and filter
  const { data: contactsData, isLoading } = useGetCrmContacts({
    page: 0,
    size: 100,
    sortKey: "DEAL_VALUE",
    sortOrder: "DESC",
    searchKeyword: searchTerm.trim() || undefined,
    companyIds
  });

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
    return (contactsData?.items ?? []).map(mapContactToTableRow);
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
        <Typography variant="body2" color="common.black" noWrap>
          {value as string}
        </Typography>
      ),
      width: "21%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "contactNo"]),
      header: translateText(["table", "columns", "contactNo"]),
      key: "contactNumber",
      render: (value) => (
        <Typography variant="body2" color="common.black" noWrap>
          {value as string}
        </Typography>
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
    openContactSidePanel({
      id: Number(row.id),
      name: row.contact.name,
      company: row.contact.company !== "—" ? row.contact.company : null
    });
  };

  return (
    <>
      <Box display="flex" flexDirection="column" gap={3} width="100%">
        <Box
          display="flex"
          alignItems={{ xs: "stretch", sm: "center" }}
          flexDirection={{ xs: "column", sm: "row" }}
          gap={2}
          justifyContent="space-between"
          width="100%"
        >
          <InputField
            aria-label={translateText(["search", "ariaLabel"])}
            ariaLabelClearButton={translateText(["search", "clearAriaLabel"])}
            className="w-full max-w-[26rem]"
            customStyles={{
              borderRadius: "rounded-full",
            }}
            placeholder={translateText(["search", "placeholder"])}
            rightIcon={<SearchIcon width={16} height={16} />}
            type="search"
            variant="sm"
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
        </Box>

        <Table
          columns={columns}
          data={tableData}
          emptyStateType={emptyStateType}
          generateRowAriaLabel={(row) =>
            translateText(["table", "rowAriaLabel"], {
              name: row.contact.name
            })
          }
          hasMore={false}
          height="35rem"
          isLoading={isLoading}
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
      </Box>
    </>
  );
};

export default ContactsListView;
