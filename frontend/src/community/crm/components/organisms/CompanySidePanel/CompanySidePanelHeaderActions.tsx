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
  const translateAria = useTranslator("crmAria");

  if (!isCrmSalesManager) {
    return null;
  }

  return (
    <KebabMenu
      id="company-actions"
      menuItems={menuItems}
      anchorButton={{
        "aria-label": translateAria(["companies", "sidePanel", "kebabMenu"])
      }}
      className={{
        anchorElement:
          "h-9 w-9 bg-tertiary-background hover:bg-secondary-accent"
      }}
    />
  );
};

export default CompanySidePanelHeaderActions;
