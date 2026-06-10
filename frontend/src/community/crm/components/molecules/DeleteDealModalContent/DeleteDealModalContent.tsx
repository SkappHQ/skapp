import { SmallModal } from "@rootcodelabs/skapp-ui";

import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/store";

const DeleteDealModalContent: React.FC = () => {
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

  const handleCloseModal = () => {
    setIsDealModalOpen(false);
    setCurrentDeletingDeal(null);
  };

  const handleDeleteDeal = () => {
    // Add handle delete functionality with Toast messages for success and error cases
  };

  return (
    <SmallModal
      isOpen={isDealModalOpen}
      onClose={handleCloseModal}
      modalHeader={translateText(["areYouSureModalTitle"])}
      content={
        <UserPromptModal
          description={translateText(["description"], {
            dealName: currentDeletingDeal?.name
          })}
          primaryBtn={{
            label: translateText(["buttons", "confirm"]),
            buttonStyle: ButtonStyle.ERROR,
            endIcon: IconName.DELETE_BUTTON_ICON,
            onClick: handleDeleteDeal
          }}
          secondaryBtn={{
            label: translateText(["buttons", "cancel"]),
            buttonStyle: ButtonStyle.TERTIARY,
            endIcon: IconName.CLOSE_ICON,
            onClick: handleCloseModal
          }}
        />
      }
    />
  );
};

export default DeleteDealModalContent;
