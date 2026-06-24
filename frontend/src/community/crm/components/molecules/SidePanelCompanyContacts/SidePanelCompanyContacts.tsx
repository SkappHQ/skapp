import {
  ButtonV2,
  Label,
  PlusIcon,
  SearchIcon,
  Table,
  TableColumn
} from "@rootcodelabs/skapp-ui";
import React from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmContactMetricsType } from "~community/crm/types/CommonTypes";

const SidePanelCompanyContacts: React.FC<{
  contacts: CrmContactMetricsType[];
}> = ({ contacts }) => {
  const translateText = useTranslator(
    "crmModule",
    "companies",
    "companyDetailsSidePanel",
    "sidePanelCompanyContacts"
  );

  const columns: TableColumn<CrmContactMetricsType>[] = [
    {
      columnAriaLabel: translateText(["columns", "contact"]),
      header: translateText(["columns", "contact"]),
      key: "contact",
      render(_value, row) {
        return (
          <div className="flex flex-col gap-1">
            <div>{row.name}</div>
            <div className="body2 text-secondary-text">{row.company?.name}</div>
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
      key: "contactNumber",
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["columns", "revenue"]),
      header: translateText(["columns", "revenue"]),
      key: "revenue",
      render(_value, row) {
        return (
          <div className="flex flex-col gap-1 text-right">
            <div>{row.closedDealValue}</div>
            <div className="subtitle4 text-secondary-text">
              {row.closedDealCount > 0
                ? `${row.closedDealCount} ${translateText(["dealsClosed"])}`
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
        if (row.openTaskCount === 0) return "-";
        return (
          <div className="flex flex-row items-center gap-2 tabular-nums">
            <div>{row.openTaskCount}</div>
            {row.overdueTaskCount !== undefined && row.overdueTaskCount > 0 && (
              <Label
                backgroundColor="bg-semantic-red-background"
                textColor="text-semantic-red-text"
              >
                {`${row.overdueTaskCount} ${translateText(["overdue"])}`}
              </Label>
            )}
          </div>
        );
      },
      width: "15%"
    }
  ];

  return (
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
  );
};

export default SidePanelCompanyContacts;
