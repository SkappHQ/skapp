import {
  Card,
  DeleteButtonIcon,
  EditSquareIcon,
  KebabMenu,
  MenuItemProps,
  UsersIcon
} from "@rootcodelabs/skapp-ui";
import { FC, MouseEvent } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { BusinessUnit } from "~community/common/types/BusinessUnitTypes";

interface BusinessUnitCardProps {
  businessUnit: BusinessUnit;
  onEdit?: (businessUnit: BusinessUnit) => void;
  onDelete?: (businessUnit: BusinessUnit) => void;
}

const BusinessUnitCard: FC<BusinessUnitCardProps> = ({
  businessUnit,
  onEdit,
  onDelete
}) => {
  const translateText = useTranslator("configurations", "businessUnit");

  const menuItems: MenuItemProps[] = [
    {
      id: `${businessUnit.businessUnitId}-edit`,
      label: translateText(["card", "editAction"]),
      icon: { start: <EditSquareIcon /> },
      onClick: () => onEdit?.(businessUnit)
    },
    {
      id: `${businessUnit.businessUnitId}-delete`,
      label: translateText(["card", "deleteAction"]),
      icon: { start: <DeleteButtonIcon width="16" height="16" /> },
      onClick: () => onDelete?.(businessUnit)
    }
  ];

  return (
    <Card
      aria-label={businessUnit.name}
      className="flex w-full h-[84px] mb-0 items-center gap-8 bg-white border-secondary-accent"
    >
      <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-tertiary-background text-secondary-icon">
        <UsersIcon />
      </span>

      <span
        className="subtitle1 flex-1 truncate text-left text-black"
        title={businessUnit.name}
      >
        {businessUnit.name}
      </span>

      <div onClick={(e: MouseEvent) => e.stopPropagation()}>
        <KebabMenu
          id={`business-unit-${businessUnit.businessUnitId}-menu`}
          menuItems={menuItems}
          isFlip
        />
      </div>
    </Card>
  );
};

export default BusinessUnitCard;
