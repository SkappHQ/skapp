import { SmallModal } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/store";

const DeleteDealModal = () => {
  const {
    isDealModalOpen,
    currentDeletingDeal,
    setIsDealModalOpen,
    setCurrentDeletingDeal
  } = useCrmStore((store) => ({
    isDealModalOpen: store.isDealModalOpen,
    currentDeletingDeal: store.currentDeletingDeal,
    setIsDealModalOpen: store.setIsDealModalOpen,
    setCurrentDeletingDeal: store.setCurrentDeletingDeal
  }));

  const translateText = useTranslator("crmModule", "deals", "deleteDealModal");

  const handleCloseModal = (): void => {
    setIsDealModalOpen(false);
    setCurrentDeletingDeal(null);
  };

  const handleDeleteDeal = (): void => {
    // Add handle delete functionality with Toast messages for success and error cases
  };

  return (
    <SmallModal
      isOpen={isDealModalOpen}
      onClose={handleCloseModal}
      modalHeader={translateText(["areYouSureModalTitle"])}
      content={
        <p>
          {translateText(["description"], {
            dealName: currentDeletingDeal?.name
          })}
        </p>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: handleCloseModal,
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
