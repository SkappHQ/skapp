import { Table, TableColumn } from "@rootcodelabs/skapp-ui";
import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

export interface ContactRow {
  id: string;
  name: string;
  company: string;
  email: string;
  contactNo: string;
  revenue: string;
  dealsClosed: number;
  openTasks: number;
  overdueTasks?: number;
}

interface CompanyContactsProps {
  contacts: ContactRow[];
}

const columns: TableColumn<ContactRow>[] = [
  {
    key: "contact",
    header: "CONTACT",
    render: (_value, row) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-semibold text-zinc-900">{row.name}</span>
        <span className="text-xs text-zinc-500">{row.company}</span>
      </div>
    )
  },
  {
    key: "email",
    header: "EMAIL",
    width: "25%",
    render: (_value, row) => (
      <span className="text-base text-zinc-900">{row.email}</span>
    )
  },
  {
    key: "contactNo",
    header: "CONTACT NO.",
    width: "20%",
    render: (_value, row) => (
      <span className="text-base text-zinc-900">{row.contactNo}</span>
    )
  },
  {
    key: "revenue",
    header: "REVENUE",
    render: (_value, row) => (
      <div className="flex flex-col">
        <span className="text-base text-zinc-900">
          {row.revenue}
        </span>
        <span className="text-xs text-zinc-500">
          {row.dealsClosed} Deals closed
        </span>
      </div>
    )
  },
  {
    key: "openTasks",
    header: "OPEN TASKS",
    render: (_value, row) => (
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-zinc-900">
          {row.openTasks}
        </span>
        {row.overdueTasks > 0 && (
          <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
            {row.overdueTasks} overdue
          </span>
        )}
      </div>
    )
  }
];

const CompanyContacts: React.FC<CompanyContactsProps> = ({ contacts }) => {
  return (
    <div className="flex flex-col pt-6">
      <h3 className="text-lg font-bold text-zinc-900">Contacts</h3>
      <div className="w-full h-px bg-zinc-200 my-3"></div>
      <Table<ContactRow>
        columns={columns}
        data={contacts}
        tableAriaLabel="Company contacts"
        height="auto"
        className=""
        emptyStateType="no-data"
        noDataState={{
          icon: (
            <Icon
              name={IconName.SEARCH_ICON}
              width="24px"
              height="24px"
              fill="#a1a1aa"
            />
          ),
          title: "No contacts",
          description: "No contacts associated with this company"
        }}
      />
    </div>
  );
};

export default CompanyContacts;