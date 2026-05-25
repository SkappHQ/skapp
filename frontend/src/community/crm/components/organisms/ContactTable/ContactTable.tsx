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
import { ChangeEvent, useMemo, useState } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetContactMetrics,
  useGetCrmCompanies
} from "~community/crm/api/CrmContactsApi";
import {
  CONTACT_NAME_DEBOUNCE_DELAY,
  DEFAULT_PAGE_SIZE
} from "~community/crm/constants/contactConstants";
import { CrmContactMetricsType } from "~community/crm/types/CommonTypes";
import {
  formatTasks,
  formatValue
} from "~community/crm/utils/companyTableHelpers";

const ALL_COMPANIES = "all";

export const ContactTable: React.FC = () => {
  const translateText = useTranslator("crmModule", "contacts");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>(ALL_COMPANIES);
  const debouncedSearch = useDebounce(searchTerm, CONTACT_NAME_DEBOUNCE_DELAY);

  const companyId =
    selectedCompany === ALL_COMPANIES ? undefined : Number(selectedCompany);

  const emptyStateType =
    debouncedSearch.trim() === "" && companyId === undefined
      ? EmptyStateTypeEnum.NO_DATA
      : EmptyStateTypeEnum.NO_SEARCH_RESULTS;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetContactMetrics(debouncedSearch, DEFAULT_PAGE_SIZE, companyId);

  const { data: companiesData } = useGetCrmCompanies({ page: 0, size: 100 });

  const contacts = useMemo(() => {
    return data?.pages.flatMap((page) => page?.items ?? []);
  }, [data]);

  const companyOptions = useMemo(
    () => [
      {
        id: ALL_COMPANIES,
        label: translateText(["table", "companyFilter", "allCompanies"]),
        value: ALL_COMPANIES
      },
      ...(companiesData?.items ?? []).map((company) => ({
        id: String(company.id),
        label: company.name,
        value: String(company.id)
      }))
    ],
    [companiesData, translateText]
  );

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

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
        return <div className="flex items-baseline">{value ?? "-"}</div>;
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
            <div>{formatValue(value)}</div>
            <div className="subtitle4 text-secondary-text">
              {row.closedDealCount > 0
                ? `${row.closedDealCount} ${translateText(["table", "closedDealsLabel"])}`
                : ""}
            </div>
          </div>
        );
      },
      className: "text-right pr-10.5",
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
              >{`${row.overdueTaskCount} ${translateText(["table", "overdueLabel"])}`}
              </Label>
            )}
          </div>
        );
      },
      className: "pl-24",
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
      render(value) {
        const owner = value as CrmContactMetricsType["owner"];
        return (
          <AvatarChip
            avatarProps={{
              id: `owner-${owner.employeeId}`,
              src: owner.authPic ?? undefined,
              firstName: owner.firstName,
              lastName: owner.lastName
            }}
            label={`${owner.firstName} ${owner.lastName}`.trim()}
            backgroundColor="bg-zinc-100"
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
          onChange={handleSearchChange}
          customStyles={{ borderRadius: "rounded-[1.5rem]" }}
        />
        <Dropdown
          ariaLabel={translateText(["table", "companyFilter", "ariaLabel"])}
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
        columns={columns as TableColumn<any>[]}
        data={contacts ?? []}
        emptyStateType={emptyStateType}
        isLoading={isLoading && contacts?.length === 0}
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
      />
    </div>
  );
};
