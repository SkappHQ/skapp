import { Box } from "@mui/material";
import {
  EmptyStateType,
  InputField,
  ProjectTableSkeletonLoader,
  SearchIcon,
  Table,
  TableColumn
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, useMemo, useState } from "react";

import FilterButton from "~community/common/components/molecules/FilterButton/FilterButton";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetAllCompanies } from "~community/crm/api/CompanyApi";
import { EmptyStateTypeEnum } from "~community/crm/enums/CrmCompanyEnums";
import { CrmCompanyType } from "~community/crm/types/CrmCompanyTypes";

export const CompanyTable: React.FC = () => {
  const translateText = useTranslator("crmModule", "companies");

  const [searchTerm, setSearchTerm] = useState("");
  const [emptyStateType, setEmptyStateType] = useState<EmptyStateType>(
    EmptyStateTypeEnum.NO_DATA
  );

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetAllCompanies(debouncedSearch, 12);

  const companies = useMemo(() => {
    return data?.pages.flatMap((page) => page?.items ?? []) ?? [];
  }, [data]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setEmptyStateType(
      value.trim() === ""
        ? EmptyStateTypeEnum.NO_DATA
        : EmptyStateTypeEnum.NO_SEARCH_RESULTS
    );
  };

  const columns: TableColumn<CrmCompanyType>[] = [
    {
      columnAriaLabel: translateText(["table", "columns", "nameAriaLabel"]),
      header: translateText(["table", "columns", "nameHeader"]),
      key: "name",
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "phoneAriaLabel"]),
      header: translateText(["table", "columns", "phoneHeader"]),
      key: "contactNumber",
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "tasksAriaLabel"]),
      header: translateText(["table", "columns", "tasksHeader"]),
      key: "tasks",
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "pipelineAriaLabel"]),
      header: translateText(["table", "columns", "pipelineHeader"]),
      key: "pipeline",
      width: "20%"
    },
    {
      columnAriaLabel: translateText([
        "table",
        "columns",
        "accountValueAriaLabel"
      ]),
      header: translateText(["table", "columns", "accountValueHeader"]),
      key: "accountValue",
      width: "20%"
    }
  ];

  const tableData = companies.map((company: CrmCompanyType) => ({
    id: company.id.toString(),
    name: company.name,
    tasks: company.industry ?? "-",
    pipeline: company.website ?? "-",
    contactNumber: company.contactNumber ?? "-"
  }));

  const loadMore = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  return (
    <Box display={"flex"} flexDirection="column" gap={1} width="100%">
      <Box
        display={"flex"}
        flexDirection="row"
        gap={1}
        width="100%"
        justifyContent={"space-between"}
      >
        <InputField
          ariaLabelClearButton={translateText([
            "table",
            "clearButtonAriaLabel"
          ])}
          className="w-full"
          placeholder={translateText(["table", "search"])}
          rightIcon={<SearchIcon />}
          state="default"
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <FilterButton
          id={""}
          position={"bottom-end"}
          handleApplyBtnClick={function (): void {
            throw new Error("Function not implemented.");
          }}
          handleResetBtnClick={function (): void {
            throw new Error("Function not implemented.");
          }}
          children={undefined}
          selectedFilters={[]}
          isResetBtnDisabled={true}
        />
      </Box>

      <Table
        columns={columns as TableColumn<any>[]}
        data={tableData}
        emptyStateType={emptyStateType}
        isLoading={isLoading && companies.length === 0}
        customSkeletonLoader={<ProjectTableSkeletonLoader rowCount={8} />}
        height="35.3125rem"
        hasMore={hasNextPage}
        onRowClick={() => {
          return;
        }}
        onLoadMore={loadMore}
        infiniteScrollLoadingMessage={translateText([
          "table",
          "infiniteScrollLoadingMessage"
        ])}
        scrollThreshold={0.8}
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
    </Box>
  );
};
