import React from "react";

import Table from "~community/common/components/molecules/Table/Table";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmSidePanelContactRow } from "~community/crm/types/CrmContactTypes";

interface SidePanelCompanyContactsProps {
  contacts: CrmSidePanelContactRow[];
}

const SidePanelCompanyContacts: React.FC<SidePanelCompanyContactsProps> = ({ contacts }) => {
  const translateText = useTranslator("crmModule", "companies", "companyDetailsSidePanel", "sidePanelCompanyContacts");

  const tableHeaders = [
    { id: "contact", label: translateText(["columns", "contact"]) },
    { id: "email", label: translateText(["columns", "email"]) },
    { id: "contactNo", label: translateText(["columns", "contactNo"]) },
    { id: "revenue", label: translateText(["columns", "revenue"]) },
    { id: "openTasks", label: translateText(["columns", "openTasks"]) }
  ];

  const transformToTableRows = () => {
    return contacts.map((row) => ({
      id: row.id,
      ariaLabel: {
        row: translateText(["rowAriaLabel"], {
          name: row.name,
          company: row.company,
          email: row.email,
          contactNo: row.contactNo,
          revenue: row.revenue,
          openTasks: row.openTasks.toString()
        })
      },
      contact: (
        <div className="flex flex-col justify-center -my-1">
          <span className="body1 leading-[1.2]">{row.name}</span>
          <span className="body3 text-secondary-text leading-[1.2]">{row.company}</span>
        </div>
      ),
      email: <span className="body1 leading-tight block -my-1">{row.email}</span>,
      contactNo: <span className="body1 leading-tight block -my-1">{row.contactNo}</span>,
      revenue: (
        <div className="flex flex-col justify-center -my-1">
          <span className="body1 leading-[1.2]">{row.revenue}</span>
          <span className="body3 text-secondary-text leading-[1.2]">
            {translateText(["dealsClosed"], { count: row.dealsClosed.toString() })}
          </span>
        </div>
      ),
      openTasks: (
        <div className="flex items-center gap-2 -my-1">
          <span className="body1 leading-tight">{row.openTasks}</span>
          {row.overdueTasks !== undefined && row.overdueTasks > 0 && (
            <span className="text-[10px] font-medium text-semantic-danger-text bg-semantic-danger-background px-2 py-0.5 rounded-full leading-none">
              {translateText(["overdue"], { count: row.overdueTasks.toString() })}
            </span>
          )}
        </div>
      )
    }));
  };

  return (
    <div className="flex flex-col pt-6 w-full">
      <h3 className="h3">{translateText(["title"])}</h3>
      <div className="w-full h-px bg-zinc-200 my-3"></div>
      <Table
        tableName={TableNames.CRM_SIDE_PANEL_CONTACTS}
        headers={tableHeaders}
        rows={transformToTableRows()}
        tableHead={{
          customStyles: {
            row: {
              borderTopLeftRadius: "0.25rem",
              borderTopRightRadius: "0.25rem"
            },
            cell: {
              border: "none"
            }
          }
        }}
        tableBody={{
          customStyles: {
            row: {
              active: { height: "3.75rem" }
            }
          },
          emptyState: {
            noData: {
              title: translateText(["noContacts"]),
              description: translateText(["noContactsDescription"])
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
            maxHeight: "14.25rem",
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

export default SidePanelCompanyContacts;
