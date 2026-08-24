import {
  GridHeader,
  GridRow,
  SearchIcon,
  TableV2
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  formatCurrency,
  formatTableValue
} from "~community/crm/v2/utils/commonUtil";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";

interface SidePanelContactsSectionProps {
  contactIds?: number[];
  emptyDescription?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
}

const SidePanelContactsSection: FC<SidePanelContactsSectionProps> = ({
  contactIds,
  emptyDescription,
  hasNextPage = false,
  isFetchingNextPage = false,
  onFetchNextPage
}) => {
  const translateText = useTranslator("crmModule", "contacts", "table");

  const contacts = useCrmStoreV2((store) => store.contacts);

  const tableHeaders: GridHeader[] = [
    {
      id: "name",
      label: translateText(["columns", "nameHeader"]),
      width: "40%"
    },
    {
      id: "openTasksCount",
      label: translateText(["columns", "tasksHeader"]),
      width: "25%"
    },
    {
      id: "closedDealValue",
      label: translateText(["columns", "closedValueHeader"]),
      width: "35%",
      align: "right"
    }
  ];

  const tableRows: GridRow[] = (contactIds ?? []).map((contactId) => {
    const contact = contacts[contactId];
    const contactName = getContactDisplayName(contact);

    return {
      id: contactId,
      ariaLabel: contactName,
      name: (
        <span className="body2 block w-full truncate" title={contactName}>
          {contactName}
        </span>
      ),
      openTasksCount: (
        <span className="body3">
          {formatTableValue(contact.metrics?.openTasksCount)}
        </span>
      ),
      closedDealValue: (
        <span className="body3">
          {formatCurrency(contact.metrics?.closedDealValue)}
        </span>
      )
    };
  });

  return (
    <TableV2
      variant="list"
      headers={tableHeaders}
      rows={tableRows}
      emptyState={{
        icon: <SearchIcon />,
        title: translateText(["emptyDataState", "title"]),
        description:
          emptyDescription ?? translateText(["emptyDataState", "description"])
      }}
      hasMore={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={onFetchNextPage}
    />
  );
};

export default SidePanelContactsSection;
