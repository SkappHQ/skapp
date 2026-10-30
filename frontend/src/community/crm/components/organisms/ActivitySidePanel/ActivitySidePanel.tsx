import {
  DeleteButtonIcon,
  KebabMenu,
  MenuItemProps,
  SidePanel
} from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import SidePanelHeaderActionsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";
import { useCrmStore } from "~community/crm/store/store";
import { CrmDealEntity } from "~community/crm/types/CrmCommonTypes";
import { mergeDeals } from "~community/crm/utils/dealUtil";

import ActivitySidePanelSkeleton from "./ActivitySidePanelSkeleton";

interface Props {
  id: string;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  icon: ReactNode;
  menuItems: MenuItemProps[];
  deleteLabel: string;
  onDelete: () => void;
  menuAriaLabel: string;
  emptyDealsDescription: string;
  title?: string;
  comments?: string;
  deal?: CrmDealEntity;
  info?: ReactNode;
}

const ActivitySidePanel: FC<Props> = ({
  id,
  isOpen,
  isLoading,
  onClose,
  icon,
  menuItems,
  deleteLabel,
  onDelete,
  menuAriaLabel,
  emptyDealsDescription,
  title,
  comments,
  deal,
  info
}) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "activitySidePanel"
  );

  const { deals, setDeals } = useCrmStore(
    useShallow((state) => ({
      deals: state.deals,
      setDeals: state.setDeals
    }))
  );

  useEffect(() => {
    if (!deal) return;

    setDeals(mergeDeals(deals, [deal]));
  }, [deal]);

  const dealId = deal?.id;

  const actionItems: MenuItemProps[] = [
    ...menuItems,
    {
      id: "delete",
      label: deleteLabel,
      icon: {
        start: (
          <DeleteButtonIcon
            width="12px"
            height="14px"
            fill="var(--color-semantic-red-text)"
          />
        )
      },
      activeBehavior: "hover:bg-semantic-red-background text-semantic-red-text",
      onClick: onDelete
    }
  ];

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdropClick
      header={
        isLoading ? (
          <SidePanelHeaderSkeleton isShowLastUpdate={false} />
        ) : (
          <div className="flex items-center gap-4 pl-2">
            {icon}
            <h2 className="h2 text-black">{title}</h2>
          </div>
        )
      }
      headerActions={
        isLoading ? (
          <SidePanelHeaderActionsSkeleton />
        ) : (
          <KebabMenu
            id={`${id}-actions`}
            menuItems={actionItems}
            anchorButton={{ "aria-label": menuAriaLabel }}
            className={{
              anchorElement:
                "hover:bg-secondary-accent bg-tertiary-background w-9 h-9"
            }}
          />
        )
      }
    >
      {isLoading ? (
        <div aria-busy="true">
          <ActivitySidePanelSkeleton />
        </div>
      ) : (
        <div className="flex gap-6 pb-4">
          <div className="flex flex-col flex-1 gap-6 min-w-0">
            <div className="flex flex-col gap-1">
              <p className="subtitle1">{translateText(["comments"])}</p>
              <p className="subtitle3 max-h-24 overflow-y-auto break-words">
                {comments ? comments : translateText(["noComments"])}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="h2">{translateText(["dealsTitle"])}</h2>
              <hr className="border-secondary-accent" />
              <SidePanelDealSection
                dealIds={dealId && deals[dealId] ? [dealId] : []}
                showAddDealAction={false}
                emptyHeightClassName="h-[163px]"
                emptyDescription={emptyDealsDescription}
              />
            </div>
          </div>

          <div className="w-[18.438rem] shrink-0">{info}</div>
        </div>
      )}
    </SidePanel>
  );
};

export default ActivitySidePanel;
