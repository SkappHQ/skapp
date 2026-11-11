import {
  DeleteButtonIcon,
  KebabMenu,
  MenuItemProps,
  SidePanel
} from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelActivityComments from "~community/crm/components/molecules/SidePanelActivityComments/SidePanelActivityComments";
import SidePanelActivityDeal from "~community/crm/components/molecules/SidePanelActivityDeal/SidePanelActivityDeal";
import SidePanelActivityTitle from "~community/crm/components/molecules/SidePanelActivityTitle/SidePanelActivityTitle";
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
  commentsTitle?: string;
  emptyCommentsText?: string;
  title?: string;
  comments?: string;
  deal?: CrmDealEntity;
  info?: ReactNode;
  related?: ReactNode;
  onTitleSave: (title: string) => void;
  onCommentsSave: (comments: string) => void;
  onDealChange: (dealId: number | null) => void;
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
  commentsTitle,
  emptyCommentsText,
  title,
  comments,
  deal,
  info,
  related,
  onTitleSave,
  onCommentsSave,
  onDealChange
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

  const { isCrmSalesManager, isCrmAdmin, isSuperAdmin } = useSessionData();
  const isDeleteAllowed = isCrmSalesManager || isCrmAdmin || isSuperAdmin;

  const deleteItem: MenuItemProps = {
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
  };

  const actionItems: MenuItemProps[] = [
    ...menuItems,
    ...(isDeleteAllowed ? [deleteItem] : [])
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
            {title && (
              <SidePanelActivityTitle
                id={id}
                title={title}
                onSave={onTitleSave}
              />
            )}
          </div>
        )
      }
      headerActions={
        isLoading ? (
          <SidePanelHeaderActionsSkeleton />
        ) : (
          actionItems.length > 0 && (
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
            <SidePanelActivityComments
              id={id}
              comments={comments}
              onSave={onCommentsSave}
              {...(commentsTitle && { title: commentsTitle })}
              {...(emptyCommentsText && { emptyText: emptyCommentsText })}
            />

            <div className="flex flex-col gap-3">
              <h2 className="h2">{translateText(["dealsTitle"])}</h2>
              <hr className="border-secondary-accent" />
              <SidePanelActivityDeal
                id={id}
                dealId={deal && deal.id && deals[deal.id] ? deal.id : null}
                emptyDescription={emptyDealsDescription}
                onDealChange={onDealChange}
              />
            </div>

            {related}
          </div>

          <div className="w-[18.438rem] shrink-0">{info}</div>
        </div>
      )}
    </SidePanel>
  );
};

export default ActivitySidePanel;
