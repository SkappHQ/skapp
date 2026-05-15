import { Typography } from "@mui/material";
import {
  Label,
  ProjectTableSkeletonLoader,
  SearchIcon,
  Table,
  TableColumn
} from "@rootcodelabs/skapp-ui";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { EmptyStateTypeEnum } from "~community/crm/enums/CrmCompanyEnums";
import { CrmCompanyTableDataType } from "~community/crm/types/CommonTypes";

const CompanyContactsTables = () => {
  const translateText = useTranslator("crmModule", "companies");

  const columns: TableColumn<CrmCompanyTableDataType>[] = [
    {
      columnAriaLabel: translateText(["table", "columns", "nameAriaLabel"]),
      header: "CONTACT",
      key: "contact",
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "phoneAriaLabel"]),
      header: "EMAIL",
      key: "email",
      width: "25%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "emailAriaLabel"]),
      header: "CONTACT NO.",
      key: "contact",
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "emailAriaLabel"]),
      header: "REVENUE",
      key: "revenue",
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table", "columns", "emailAriaLabel"]),
      header: "OPEN TASKS",
      key: "openTasks",
      width: "15%"
    }
  ];

  const tableData: any[] = [];

  return (
    <div className="flex flex-col gap-2">
      <Typography variant="h1">Contacts</Typography>
      <Table
        columns={columns as TableColumn<any>[]}
        data={tableData}
        emptyStateType={EmptyStateTypeEnum.NO_DATA}
        isLoading={false}
        height="15rem"
        customSkeletonLoader={<ProjectTableSkeletonLoader rowCount={8} />}
        hasMore={false}
        onRowClick={() => {}}
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

export default CompanyContactsTables;
