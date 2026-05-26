import { Label, PlusIcon, SearchIcon, Table, TableColumn } from "@rootcodelabs/skapp-ui";
import React, { ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmSidePanelContactRow } from "~community/crm/types/CrmContactTypes";

interface SidePanelCompanyContactsProps {
  contacts: CrmSidePanelContactRow[];
}

const formatContactName = (
  name: string,
  company: string
): ReactNode => {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-gray-900">{name}</div>
      <div className="text-sm text-slate-600">{company}</div>
    </div>
  );
};

const formatRevenue = (
  revenue: string,
  dealsClosed: number
): ReactNode => {
  return (
    <div className="flex flex-col gap-1 text-right">
      <div className="text-gray-900">{revenue}</div>
      <div className="text-sm text-slate-600">{`${dealsClosed} Deals closed`}</div>
    </div>
  );
};

const formatOpenTasks = (
  openTasks: number,
  overdueTasks?: number
): ReactNode => {
  if (openTasks === 0) return "-";
  return (
    <div className="flex flex-row items-center gap-2 tabular-nums">
      <div className="text-gray-900">{`${openTasks}`}</div>
      {overdueTasks !== undefined && overdueTasks > 0 && (
        <Label
          backgroundColor="bg-red-100"
          textColor="text-red-900"
        >{`${overdueTasks} overdue`}</Label>
      )}
    </div>
  );
};

const SidePanelCompanyContacts: React.FC<SidePanelCompanyContactsProps> = ({ contacts }) => {
  const translateText = useTranslator("crmModule", "companies", "companyDetailsSidePanel", "sidePanelCompanyContacts");

  const columns: TableColumn<CrmSidePanelContactRow>[] = [
    {
      columnAriaLabel: translateText(["columns", "contact"]),
      header: translateText(["columns", "contact"]),
      key: "name",
      render(_value, row) {
        return formatContactName(row.name, row.company);
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
        return formatRevenue(row.revenue, row.dealsClosed);
      },
      className: "justify-end text-right",
      width: "15%"
    },
    {
      columnAriaLabel: translateText(["columns", "openTasks"]),
      header: translateText(["columns", "openTasks"]),
      key: "openTasks",
      render(_value, row) {
        return formatOpenTasks(row.openTasks, row.overdueTasks);
      },
      width: "15%"
    }
  ];

  return (
    <div className="flex flex-col pt-6 w-full">
      <h3 className="h3">{translateText(["title"])}</h3>
      <div className="w-full h-px bg-zinc-200 my-3"></div>
      <div className={contacts.length === 0 ? "[&_td>div.flex]:!h-[13.667rem] [&_td>div.flex_button]:!bg-tertiary-background [&_td>div.flex_button]:!outline-transparent" : ""}>
        <Table
          columns={columns as TableColumn<any>[]}
          data={contacts}
          emptyStateType="no-data"
          height="16.667rem"
          noDataState={{
            icon: <SearchIcon />,
            title: translateText(["noContacts"]),
            description: translateText(["noContactsDescription"]),
            buttonText: translateText(["addContact"]),
            buttonIcon: <PlusIcon />,
            onButtonClick: () => {
              // TODO: handle add contact action
            }
          }}
        />
      </div>
    </div>
  );
};

export default SidePanelCompanyContacts;
