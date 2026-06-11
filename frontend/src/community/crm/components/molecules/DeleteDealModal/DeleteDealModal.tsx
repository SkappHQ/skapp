import { SmallModal } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dealName: string;
}

const DeleteDealModal = ({ isOpen, onClose, dealName }: Props) => {
  const translateText = useTranslator("crmModule", "deals", "deleteDealModal");

  const handleDeleteDeal = (): void => {
    // Add handle delete functionality with Toast messages for success and error cases
  };

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={translateText(["areYouSureModalTitle"])}
      content={
        <p>
          {translateText(["description"], {
            dealName
          })}
        </p>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: onClose,
          icon: <Icon name={IconName.CLOSE_ICON} />,
          iconPosition: "end",
          children: translateText(["buttons", "cancel"])
        },
        buttonRight: {
          variant: "error",
          onClick: handleDeleteDeal,
          icon: (
            <Icon
              name={IconName.DELETE_BUTTON_ICON}
              fill="var(--color-semantic-red-text)"
            />
          ),
          iconPosition: "end",
          children: translateText(["buttons", "confirm"])
        }
      }}
    />
  );
};

export default DeleteDealModal;
