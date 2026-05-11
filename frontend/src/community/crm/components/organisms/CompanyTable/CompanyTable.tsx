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

  const { data: companies, isLoading } = useGetAllCompanies();

  const allCompanies = useMemo(() => {
    const list = companies ?? [];
    if (!searchTerm.trim()) return list;
    const lower = searchTerm.toLowerCase();
    return list.filter((c) => c.name.toLowerCase().includes(lower));
  }, [companies, searchTerm]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    if (event.target.value.trim() === "") {
      setEmptyStateType(EmptyStateTypeEnum.NO_DATA);
    } else {
      setEmptyStateType(EmptyStateTypeEnum.NO_SEARCH_RESULTS);
    }
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

  const tableData = allCompanies.map((company) => ({
    id: company.id.toString(),
    name: company.name,
    industry: company.industry ?? "-",
    website: company.website ?? "-",
    contactNumber: company.contactNumber ?? "-",
    address: company.address ?? "-"
  }));

  return (
    <Box display={"flex"} flexDirection="column" gap={1} width="100%">
      <InputField
        ariaLabelClearButton={translateText(["table", "clearButtonAriaLabel"])}
        className="w-full"
        placeholder={translateText(["table", "search"])}
        rightIcon={<SearchIcon />}
        state="default"
        type="search"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <Table
        columns={columns as TableColumn<any>[]}
        data={tableData}
        emptyStateType={emptyStateType}
        isLoading={isLoading}
        customSkeletonLoader={<ProjectTableSkeletonLoader rowCount={8} />}
        height="35.3125rem"
        hasMore={false}
        onRowClick={(row) => {
          return;
        }}
        onLoadMore={() => {}}
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
          title: translateText(["table", "emptySearchState", "title"]),
          description: translateText([
            "table",
            "emptySearchState",
            "description"
          ]),
          icon: <SearchIcon />
        }}
      />
    </Box>
  );
};
