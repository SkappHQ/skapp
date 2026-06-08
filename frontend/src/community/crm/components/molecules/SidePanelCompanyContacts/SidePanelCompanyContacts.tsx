import {
  Label,
  PlusIcon,
  SearchIcon,
  Table,
  TableColumn
} from "@rootcodelabs/skapp-ui";
import React from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";

interface CrmSidePanelContactRow {
  id: number;
  name: string;
  email: string;
  company: string;
  contactNo: string;
  revenue: string;
  dealsClosed: number;
  openTasks: number;
  overdueTasks?: number;
}

const SidePanelCompanyContacts: React.FC<{
  contacts: CrmSidePanelContactRow[];
}> = ({ contacts }) => {
  const translateText = useTranslator(
    "crmModule",
    "companies",
    "companyDetailsSidePanel",
    "sidePanelCompanyContacts"
  );

  const columns: TableColumn<CrmSidePanelContactRow>[] = [
    {
      columnAriaLabel: translateText(["columns", "contact"]),
      header: translateText(["columns", "contact"]),
      key: "name",
      render(_value, row) {
        return (
          <div className="flex flex-col gap-1">
            <div>{row.name}</div>
            <div className="body2 text-secondary-text">{row.company}</div>
          </div>
        );
      },
      width: "25%"
    },
    {
      columnAriaLabel: translateText(["columns", "email"]),
      header: translateText(["columns", "email"]),
      key: "email",
      width: "25%"
    },
    {
      columnAriaLabel: translateText(["columns", "contactNo"]),
      header: translateText(["columns", "contactNo"]),
      key: "contactNo",
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["columns", "revenue"]),
      header: translateText(["columns", "revenue"]),
      key: "revenue",
      render(_value, row) {
        return (
          <div className="flex flex-col gap-1 text-right">
            <div>{row.revenue}</div>
            <div className="subtitle4 text-secondary-text">
              {row.dealsClosed > 0
                ? `${row.dealsClosed} ${translateText(["dealsClosed"])}`
                : ""}
            </div>
          </div>
        );
      },
      className: "text-right",
      width: "15%"
    },
    {
      columnAriaLabel: translateText(["columns", "openTasks"]),
      header: translateText(["columns", "openTasks"]),
      key: "openTasks",
      render(_value, row) {
        if (row.openTasks === 0) return "-";
        return (
          <div className="flex flex-row items-center gap-2 tabular-nums">
            <div>{row.openTasks}</div>
            {row.overdueTasks !== undefined && row.overdueTasks > 0 && (
              <Label
                backgroundColor="bg-semantic-red-background"
                textColor="text-semantic-red-text"
              >
                {`${row.overdueTasks} ${translateText(["overdue"])}`}
              </Label>
            )}
          </div>
        );
      },
      width: "15%"
    }
  ];

  return (
    <div className="flex flex-col pt-6 w-full">
      <h3 className="h3">{translateText(["title"])}</h3>
      <div className="w-full h-px bg-secondary-accent my-3"></div>
      <Table
        className="w-full"
        columns={columns as TableColumn<any>[]}
        data={contacts ?? []}
        emptyStateType={EmptyStateTypeEnum.NO_DATA}
        height="17.25rem"
        noDataState={{
          icon: <SearchIcon />,
          title: translateText(["noContacts"]),
          description: translateText(["noContactsDescription"]),
          buttonText: translateText(["addContact"]),
          buttonIcon: <PlusIcon />,
          buttonVariant: "tertiary",
          onButtonClick: () => {
            // Add contact action
          }
        }}
      />
    </div>
  );
};

export default SidePanelCompanyContacts;
