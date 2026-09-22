import { KebabMenu, MenuItemProps } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface CompanySidePanelHeaderActionsProps {
  isCrmSalesManager: boolean;
  menuItems: MenuItemProps[];
}

const CompanySidePanelHeaderActions: FC<CompanySidePanelHeaderActionsProps> = ({
  isCrmSalesManager,
  menuItems
}) => {
  const translateText = useTranslator("crmModule", "companies", "sidePanel");

  if (!isCrmSalesManager) {
    return null;
  }

  return (
    <KebabMenu
      id="company-actions"
      menuItems={menuItems}
      anchorButton={{
        "aria-label": translateText(["kebabMenuAriaLabel"])
      }}
      className={{
        anchorElement:
          "hover:bg-secondary-accent bg-tertiary-background w-9 h-9"
      }}
    />
  );
};

export default CompanySidePanelHeaderActions;
