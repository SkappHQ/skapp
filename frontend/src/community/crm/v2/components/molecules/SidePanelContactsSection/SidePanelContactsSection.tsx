import { Label, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import TableView from "~community/common/components/organisms/TableView/TableView";
import type {
  GridHeader,
  GridRow
} from "~community/common/components/organisms/TableView/types";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  formatMonetaryValueWithDecimals,
  formatTableValue
} from "~community/crm/v2/utils/commonUtil";
import { getSelectedCompany } from "~community/crm/v2/utils/companyUtil";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";

interface SidePanelContactsSectionProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
}

const SidePanelContactsSection: FC<SidePanelContactsSectionProps> = ({
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage
}) => {
  const translateText = useTranslator("crmModuleV2");

  const { contacts, companies, selectedCompanyId } = useCrmStoreV2(
    useShallow((state) => ({
      contacts: state.contacts,
      companies: state.companies,
      selectedCompanyId: state.selectedCompanyId
    }))
  );

  const contactIds =
    getSelectedCompany(companies, selectedCompanyId)?.contactIds ?? [];

  const tableHeaders: GridHeader[] = [
    {
      id: "name",
      label: translateText([
        "companies",
        "sidePanel",
        "contactsSection",
        "columns",
        "contact"
      ]),
      width: "25%"
    },
    {
      id: "email",
      label: translateText([
        "companies",
        "sidePanel",
        "contactsSection",
        "columns",
        "email"
      ]),
      width: "25%"
    },
    {
      id: "contactNumber",
      label: translateText([
        "companies",
        "sidePanel",
        "contactsSection",
        "columns",
        "contactNo"
      ]),
      width: "20%"
    },
    {
      id: "closedDealValue",
      label: translateText([
        "companies",
        "sidePanel",
        "contactsSection",
        "columns",
        "revenue"
      ]),
      width: "15%",
      align: "right"
    },
    {
      id: "openTasksCount",
      label: translateText([
        "companies",
        "sidePanel",
        "contactsSection",
        "columns",
        "openTasks"
      ]),
      width: "15%"
    }
  ];

  const transformToTableRows = (): GridRow[] =>
    contactIds.map((contactId) => {
      const contact = contacts[contactId];
      const contactName = getContactDisplayName(contact);
      const metrics = contact.metrics;

      return {
        id: contactId,
        ariaLabel: contactName,
        name: (
          <div className="flex flex-col gap-1 min-w-0">
            <div className="truncate">{contactName}</div>
            <div className="body2 text-secondary-text truncate">
              {contact.companyId && companies[contact.companyId]?.name}
            </div>
          </div>
        ),
        email: <div className="truncate">{contact.email}</div>,
        contactNumber: (
          <div className="flex items-baseline">{contact.contactNumber}</div>
        ),
        closedDealValue: (
          <div className="flex flex-col gap-1 text-right">
            <div>
              {formatMonetaryValueWithDecimals(metrics?.closedDealValue)}
            </div>
            <div className="subtitle4 text-secondary-text">
              {metrics?.closedDealCount !== undefined &&
              metrics.closedDealCount > 0
                ? `${metrics.closedDealCount} ${translateText(
                    [
                      "companies",
                      "sidePanel",
                      "contactsSection",
                      "dealsClosed"
                    ],
                    {
                      count: metrics.closedDealCount
                    }
                  )}`
                : ""}
            </div>
          </div>
        ),
        openTasksCount: (
          <div className="flex flex-row items-center gap-2 tabular-nums">
            <div>{formatTableValue(metrics?.openTasksCount)}</div>
            {metrics?.overdueTasksCount !== undefined &&
              metrics.overdueTasksCount > 0 && (
                <Label
                  backgroundColor="bg-semantic-red-background"
                  textColor="text-semantic-red-text"
                >
                  {`${metrics.overdueTasksCount} ${translateText(["companies", "sidePanel", "contactsSection", "overdue"])}`}
                </Label>
              )}
          </div>
        )
      };
    });

  return (
    <TableView
      headers={tableHeaders}
      rows={transformToTableRows()}
      emptyState={{
        icon: <SearchIcon />,
        title: translateText([
          "companies",
          "sidePanel",
          "contactsSection",
          "noContacts"
        ]),
        description: translateText([
          "companies",
          "sidePanel",
          "contactsSection",
          "noContactsDescription"
        ])
      }}
      infiniteScroll={{
        isEnabled: true,
        height: "34.5rem",
        hasMore: hasNextPage,
        isFetchingNextPage,
        onLoadMore: onFetchNextPage,
        loadingMessage: translateText([
          "companies",
          "sidePanel",
          "contactsSection",
          "infiniteScrollLoadingMessage"
        ])
      }}
    />
  );
};

export default SidePanelContactsSection;
