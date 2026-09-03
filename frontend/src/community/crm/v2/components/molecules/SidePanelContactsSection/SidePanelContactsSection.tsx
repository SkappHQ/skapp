import { Label, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import TableView from "~community/common/components/organisms/TableView/TableView";
import type {
  GridHeader,
  GridRow
} from "~community/common/components/organisms/TableView/types";
import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  formatMonetaryValue,
  formatTableValue
} from "~community/crm/v2/utils/commonUtil";
import { getCompanyById } from "~community/crm/v2/utils/companyUtil";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";

interface SidePanelContactsSectionProps {
  contactIds?: number[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
}

const SidePanelContactsSection: FC<SidePanelContactsSectionProps> = ({
  contactIds,
  hasNextPage = false,
  isFetchingNextPage = false,
  onFetchNextPage
}) => {
  const translateText = useTranslator(
    "crmModule",
    "companies",
    "companyDetailsSidePanel",
    "sidePanelCompanyContacts"
  );

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: () => onFetchNextPage?.()
  });

  const { contacts, companies } = useCrmStoreV2(
    useShallow((store) => ({
      contacts: store.contacts,
      companies: store.companies
    }))
  );

  const tableHeaders: GridHeader[] = [
    {
      id: "name",
      label: translateText(["columns", "contact"]),
      width: "25%"
    },
    {
      id: "email",
      label: translateText(["columns", "email"]),
      width: "25%"
    },
    {
      id: "contactNumber",
      label: translateText(["columns", "contactNo"]),
      width: "20%"
    },
    {
      id: "closedDealValue",
      label: translateText(["columns", "revenue"]),
      width: "15%",
      align: "right"
    },
    {
      id: "openTasksCount",
      label: translateText(["columns", "openTasks"]),
      width: "15%"
    }
  ];

  const transformToTableRows = (): GridRow[] =>
    (contactIds ?? []).map((contactId) => {
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
              {getCompanyById(companies, contact.companyId)?.name}
            </div>
          </div>
        ),
        email: <div className="truncate">{contact.email}</div>,
        contactNumber: (
          <div className="flex items-baseline">{contact.contactNumber}</div>
        ),
        closedDealValue: (
          <div className="flex flex-col gap-1 text-right">
            <div>{formatMonetaryValue(metrics?.closedDealValue)}</div>
            <div className="subtitle4 text-secondary-text">
              {metrics?.closedDealCount !== undefined &&
              metrics.closedDealCount > 0
                ? `${metrics.closedDealCount} ${translateText(["dealsClosed"])}`
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
                  {`${metrics.overdueTasksCount} ${translateText(["overdue"])}`}
                </Label>
              )}
          </div>
        )
      };
    });

  return (
    <div>
      <TableView
        headers={tableHeaders}
        rows={transformToTableRows()}
        emptyState={{
          icon: <SearchIcon />,
          title: translateText(["noContacts"]),
          description: translateText(["noContactsDescription"])
        }}
      />
      <div ref={loadingRef} />
    </div>
  );
};

export default SidePanelContactsSection;
