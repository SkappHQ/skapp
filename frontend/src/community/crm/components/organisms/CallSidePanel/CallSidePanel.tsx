import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
  MenuItemProps,
  SidePanel
} from "@rootcodelabs/skapp-ui";
import { FC, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import TaskTypeIcon from "~community/crm/components/atoms/TaskTypeIcon/TaskTypeIcon";
import SidePanelCallInfo from "~community/crm/components/molecules/SidePanelCallInfo/SidePanelCallInfo";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import { TASK_DETAIL_ICON_SIZE } from "~community/crm/constants/taskConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCallEntity } from "~community/crm/types/CrmCommonTypes";

interface Props {
  call: CrmCallEntity;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onContactClick?: () => void;
  onCompanyClick?: () => void;
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

  const { owners, contacts, companies } = useCrmStore(
    useShallow((state) => ({
      owners: state.owners,
      contacts: state.contacts,
      companies: state.companies
    }))
  );

  const owner = call.ownerId != null ? owners[call.ownerId] : null;
  const contact = call.contactId != null ? contacts[call.contactId] : null;
  const company = call.companyId != null ? companies[call.companyId] : null;

  const menuItems: MenuItemProps[] = useMemo(
    () => [
      {
        id: "edit",
        label: translateText(["activities", "callSidePanel", "editCall"]),
        icon: { start: <EditIcon width="16px" height="16px" /> },
        onClick: () => onEdit?.()
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
        activeBehavior:
          "hover:bg-semantic-red-background text-semantic-red-text",
        onClick: () => onDelete?.()
      }
    ],
    [translateText, onEdit, onDelete]
  );

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdropClick
      header={
        <div className="flex items-center gap-4 pl-2">
          <TaskTypeIcon typeName="call" size={TASK_DETAIL_ICON_SIZE} />
          <span className="h1 text-black">{call.subject}</span>
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
            <p className="subtitle3">
              {call.comments ??
                translateText(["activities", "callSidePanel", "noComments"])}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="h2">
              {translateText(["activities", "callSidePanel", "dealsTitle"])}
            </h2>
            <hr className="border-secondary-accent" />
            <SidePanelDealSection
              dealIds={call.dealId != null ? [call.dealId] : []}
              showAddDealAction={false}
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
            contact={contact}
            company={company}
            onContactClick={onContactClick}
            onCompanyClick={onCompanyClick}
          />
        </div>
      </div>
    </SidePanel>
  );
};

export default CallSidePanel;
