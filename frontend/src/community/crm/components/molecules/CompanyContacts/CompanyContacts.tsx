import React from "react";

import Table from "~community/common/components/molecules/Table/Table";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";

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

const CompanyContacts: React.FC<CompanyContactsProps> = ({ contacts }) => {
  const translateText = useTranslator("crmModule", "contacts");

  const tableHeaders = [
    { id: "contact", label: translateText(["table", "columns", "contact"]) },
    { id: "email", label: translateText(["table", "columns", "email"]) },
    { id: "contactNo", label: translateText(["table", "columns", "contactNo"]) },
    { id: "revenue", label: translateText(["table", "columns", "revenue"]) },
    { id: "openTasks", label: translateText(["table", "columns", "openTasks"]) }
  ];

  const transformToTableRows = () => {
    return contacts.map((row) => ({
      id: row.id,
      ariaLabel: {
        row: translateText(["table", "rowAriaLabel"], {
          name: row.name,
          company: row.company,
          email: row.email,
          contactNo: row.contactNo,
          revenue: row.revenue,
          openTasks: row.openTasks.toString()
        })
      },
      contact: (
        <div className="flex flex-col gap-0.5">
          <span className="body1 text-zinc-900 leading-[16px]">{row.name}</span>
          <span className="text-xs text-zinc-500">{row.company}</span>
        </div>
      ),
      email: <span className="text-base text-zinc-900">{row.email}</span>,
      contactNo: <span className="text-base text-zinc-900">{row.contactNo}</span>,
      revenue: (
        <div className="flex flex-col">
          <span className="text-base text-zinc-900">{row.revenue}</span>
          <span className="text-xs text-zinc-500">
            {translateText(["table", "dealsClosed"], { count: row.dealsClosed.toString() })}
          </span>
        </div>
      ),
      openTasks: (
        <div className="flex items-center gap-2">
          <span className="body1 text-zinc-900">{row.openTasks}</span>
          {row.overdueTasks !== undefined && row.overdueTasks > 0 && (
            <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
              {translateText(["table", "overdue"], { count: row.overdueTasks.toString() })}
            </span>
          )}
        </div>
      )
    }));
  };

  return (
    <div className="flex flex-col pt-6 w-full">
      <h3 className="text-lg font-bold text-zinc-900">{translateText(["title"])}</h3>
      <div className="w-full h-px bg-zinc-200 my-3"></div>
      <Table
        tableName={TableNames.COMPANY_CONTACTS_PANEL}
        headers={tableHeaders}
        rows={transformToTableRows()}
        tableHead={{
          customStyles: {
            row: {
              borderTopLeftRadius: "0.625rem",
              borderTopRightRadius: "0.625rem"
            },
            cell: {
              border: "none"
            }
          }
        }}
        tableBody={{
          emptyState: {
            noData: {
              title: translateText(["table", "noContacts"]),
              description: translateText(["table", "noContactsDescription"])
            }
          },
          loadingState: {
            skeleton: {
              rows: 3
            }
          }
        }}
        tableFoot={{
          pagination: {
            isEnabled: false
          }
        }}
        customStyles={{
          wrapper: {
            minHeight: "auto",
            backgroundColor: "transparent"
          },
          container: {
            maxHeight: "15.625rem",
            backgroundColor: "transparent",
            borderRadius: "0.625rem",
            overflow: "auto"
          },
          table: {
            backgroundColor: "transparent"
          }
        }}
      />
    </div>
  );
};

export default CompanyContacts;