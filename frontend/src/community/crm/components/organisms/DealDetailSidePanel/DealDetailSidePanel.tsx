import {
  DeleteButtonIcon,
  KebabMenu,
  SidePanel
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmDealType } from "~community/crm/types/CommonTypes";
import { useCrmStore } from "~community/crm/store/store";
import { CrmDealModalTypes } from "~community/crm/types/ModalTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  deal: CrmDealType | null;
}

const DealDetailSidePanel: FC<Props> = ({
  isOpen,
  onClose,
  deal
}) => {
  const translateText = useTranslator("crmModule", "deals", "dealDetailSidePanel");

  const { setIsDealModalOpen, setDealModalType, setCurrentDeletingDeal } =
    useCrmStore((store) => ({
      setIsDealModalOpen: store.setIsDealModalOpen,
      setDealModalType: store.setDealModalType,
      setCurrentDeletingDeal: store.setCurrentDeletingDeal
    }));

  if (!deal) return null;

  const menuItems = [
    {
      id: "delete",
      label: translateText(["deleteDeal"]),
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
      onClick: () => {
        setCurrentDeletingDeal(deal);
        setDealModalType(CrmDealModalTypes.CONFIRM_DELETE);
        setIsDealModalOpen(true);
      }
    }
  ];

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      width="lg"
      animation="slide"
      closeOnBackdropClick
      header={
        <div className="flex flex-col gap-3 pl-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-6 rounded-full shrink-0 bg-teal-500">
              <HandshakeIcon width="14" height="14" fill="var(--color-white)" />
            </div>
            <span className="body1 text-secondary-icon">#{deal.id}</span>
          </div>
        </div>
      }
      headerActions={
        <KebabMenu
          id="deal-actions"
          menuItems={menuItems}
          anchorButton={{
            "aria-label": translateText(["kebabMenuAriaLabel"])
          }}
          className={{
            anchorElement:
              "hover:bg-secondary-accent bg-tertiary-background w-9 h-9"
          }}
        />
      }
    >
    </SidePanel>
  );
};

export default DealDetailSidePanel;
