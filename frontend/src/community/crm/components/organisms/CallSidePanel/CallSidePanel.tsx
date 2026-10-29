import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
  MenuItemProps,
  PhoneFilledIcon,
  SidePanel
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelCallInfo from "~community/crm/components/molecules/SidePanelCallInfo/SidePanelCallInfo";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import { TASK_DETAIL_ICON_SIZE } from "~community/crm/constants/taskConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCallEntity } from "~community/crm/types/CrmCommonTypes";
import { mergeDeals } from "~community/crm/utils/dealUtil";

interface Props {
  call: CrmCallEntity;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onContactClick: () => void;
  onCompanyClick: () => void;
}

const CallSidePanel: FC<Props> = ({
  call,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onContactClick,
  onCompanyClick
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const { owners, deals, setDeals } = useCrmStore(
    useShallow((state) => ({
      owners: state.owners,
      deals: state.deals,
      setDeals: state.setDeals
    }))
  );

  const owner = owners[call.ownerId];
  const dealId = call.deal?.id;

  useEffect(() => {
    if (!call.deal) return;

    setDeals(mergeDeals(deals, [call.deal]));
  }, [call.deal]);

  const menuItems: MenuItemProps[] = [
    {
      id: "edit",
      label: translateText(["activities", "callSidePanel", "editCall"]),
      icon: { start: <EditIcon width="16px" height="16px" /> },
      onClick: onEdit
    },
    {
      id: "delete",
      label: translateText(["activities", "callSidePanel", "deleteCall"]),
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
        <div className="flex items-center gap-4 pl-2">
          <PhoneFilledIcon
            width={TASK_DETAIL_ICON_SIZE}
            height={TASK_DETAIL_ICON_SIZE}
          />
          <h2 className="h2 text-black">{call.subject}</h2>
        </div>
      }
      headerActions={
        <KebabMenu
          id="call-actions"
          menuItems={menuItems}
          anchorButton={{
            "aria-label": translateAria([
              "activities",
              "callSidePanel",
              "kebabMenu"
            ])
          }}
          className={{
            anchorElement:
              "hover:bg-secondary-accent bg-tertiary-background w-9 h-9"
          }}
        />
      }
    >
      <div className="flex gap-6 pb-4">
        <div className="flex flex-col flex-1 gap-6 min-w-0">
          <div className="flex flex-col gap-1">
            <p className="subtitle1">
              {translateText(["activities", "callSidePanel", "comments"])}
            </p>
            <p className="subtitle3 max-h-24 overflow-y-auto break-words">
              {call.comments
                ? call.comments
                : translateText(["activities", "callSidePanel", "noComments"])}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="h2">
              {translateText(["activities", "callSidePanel", "dealsTitle"])}
            </h2>
            <hr className="border-secondary-accent" />
            <SidePanelDealSection
              dealIds={dealId && deals[dealId] ? [dealId] : []}
              showAddDealAction={false}
              emptyHeightClassName="h-[163px]"
              emptyDescription={translateText([
                "activities",
                "callSidePanel",
                "noDealsDescription"
              ])}
            />
          </div>
        </div>

        <div className="w-[18.438rem] shrink-0">
          <SidePanelCallInfo
            call={call}
            owner={owner}
            onContactClick={onContactClick}
            onCompanyClick={onCompanyClick}
          />
        </div>
      </div>
    </SidePanel>
  );
};

export default CallSidePanel;
