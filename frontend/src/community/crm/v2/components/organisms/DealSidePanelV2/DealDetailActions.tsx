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
import { copyToClipboard } from "~community/common/utils/commonUtil";
import { LINK_COPIED_POPOVER_DURATION } from "~community/crm/v2/constants/dealConstants";

interface DealDetailActionsProps {
  dealId: number;
  onDeleteClick: () => void;
}

const DealDetailActions: FC<DealDetailActionsProps> = ({
  dealId,
  onDeleteClick
}) => {
  const translateText = useTranslator("crmModuleV2");
  const translateAria = useTranslator("crmAriaV2");
  const { isCrmSalesManager } = useSessionData();

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
      await copyToClipboard(
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
      label: translateText(["deals", "sidePanel", "deleteDeal"]),
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
      onClick: onDeleteClick
    }
  ];

  return (
    <>
      <Popover
        side="bottom"
        open={isLinkCopied}
        content={translateText(["deals", "sidePanel", "linkCopied"])}
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
              ? translateText(["deals", "sidePanel", "linkCopied"])
              : translateAria(["deals", "sidePanel", "copyLink"])
          }
        />
      </Popover>

      {isCrmSalesManager && (
        <KebabMenu
          id="deal-actions"
          menuItems={menuItems}
          anchorButton={{
            "aria-label": translateAria(["deals", "sidePanel", "kebabMenu"])
          }}
          className={{
            anchorElement:
              "hover:bg-secondary-accent bg-tertiary-background w-9 h-9"
          }}
        />
      )}
    </>
  );
};

export default DealDetailActions;
