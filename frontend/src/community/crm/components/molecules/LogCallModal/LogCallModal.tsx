import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import { useTranslator } from "~community/common/hooks/useTranslator";
import LogCallModalContent from "~community/crm/components/molecules/LogCallModalContent/LogCallModalContent";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LogCallModal: FC<Props> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("crmModule");
  const translateCommon = useTranslator(
    "commonComponents",
    "userPromptModal",
    "unsavedChangesModal"
  );

  const [isDirty, setIsDirty] = useState(false);
  const [isDiscardPromptOpen, setIsDiscardPromptOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleCloseModal = (): void => {
    setIsDirty(false);
    setIsPending(false);
    setIsDiscardPromptOpen(false);
    onClose();
  };

  const handleRequestClose = (): void => {
    if (isPending) return;

    if (isDirty && !isDiscardPromptOpen) {
      setIsDiscardPromptOpen(true);
      return;
    }

    handleCloseModal();
  };

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={handleRequestClose}
      modalHeader={
        isDiscardPromptOpen
          ? translateCommon(["title"])
          : translateText(["activities", "logCall", "modal", "title"])
      }
      content={
        isOpen && (
          <>
            {isDiscardPromptOpen && (
              <AreYouSureModal
                onPrimaryBtnClick={() => setIsDiscardPromptOpen(false)}
                onSecondaryBtnClick={handleCloseModal}
              />
            )}
            <div className={isDiscardPromptOpen ? "hidden" : "contents"}>
              <LogCallModalContent
                onCancel={handleRequestClose}
                onSaved={handleCloseModal}
                onDirtyChange={setIsDirty}
                onPendingChange={setIsPending}
              />
            </div>
          </>
        )
      }
    />
  );
};

export default LogCallModal;
