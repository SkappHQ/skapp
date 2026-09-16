import {
  CopyIcon,
  DeleteButtonIcon,
  IconButton,
  KebabMenu,
  Popover,
  TickIcon
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useState } from "react";

import ROUTES from "~community/common/constants/routes";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import DeleteDealModalV2 from "~community/crm/v2/components/molecules/DeleteDealModalV2/DeleteDealModalV2";
import { LINK_COPIED_POPOVER_DURATION } from "~community/crm/v2/constants/dealConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";

interface DealDetailActionsProps {
  dealId: number;
}

const DealDetailActions: FC<DealDetailActionsProps> = ({ dealId }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const { isCrmSalesManager } = useSessionData();

  const dealName = useCrmStoreV2((store) => store.deals[dealId]?.name);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isLinkCopied, setIsLinkCopied] = useState(false);

  useEffect(() => {
    if (!isLinkCopied) return;

    const timer = setTimeout(
      () => setIsLinkCopied(false),
      LINK_COPIED_POPOVER_DURATION
    );

    return () => clearTimeout(timer);
  }, [isLinkCopied]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${ROUTES.CRM.DEAL_DETAIL(dealId)}`
      );
      setIsLinkCopied(true);
    } catch {
      setIsLinkCopied(false);
    }
  };

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
      onClick: () => setIsDeleteModalOpen(true)
    }
  ];

  return (
    <>
      <Popover
        side="bottom"
        open={isLinkCopied}
        content={translateText(["linkCopied"])}
        className="body3 text-secondary-text rounded-lg px-3 py-2 shadow-lg"
      >
        <IconButton
          icon={
            isLinkCopied ? (
              <TickIcon fill="var(--color-semantic-green-text)" />
            ) : (
              <CopyIcon width="16" height="16" />
            )
          }
          shape="rounded"
          onClick={handleCopyLink}
          aria-label={
            isLinkCopied
              ? translateText(["linkCopied"])
              : translateText(["ariaLabels", "copyLink"])
          }
        />
      </Popover>

      {isCrmSalesManager && (
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
      )}

      <DeleteDealModalV2
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        dealName={dealName ?? ""}
      />
    </>
  );
};

export default DealDetailActions;
