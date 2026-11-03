import { ButtonV2, CloseIcon, SmallModal } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useState } from "react";

import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  title: string;
  isDirty: boolean;
  isPending: boolean;
  isSubmitting: boolean;
  cancelAriaLabel: string;
  saveAriaLabel: string;
  onSave: () => void;
  onClose: () => void;
  children: ReactNode;
}

const LogActivityModal: FC<Props> = ({
  title,
  isDirty,
  isPending,
  isSubmitting,
  cancelAriaLabel,
  saveAriaLabel,
  onSave,
  onClose,
  children
}) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "logActivity",
    "buttons"
  );
  const translateCommon = useTranslator(
    "commonComponents",
    "userPromptModal",
    "unsavedChangesModal"
  );

  const [isDiscardPromptOpen, setIsDiscardPromptOpen] = useState(false);

  const handleRequestClose = (): void => {
    if (isPending) return;

    if (isDirty && !isDiscardPromptOpen) {
      setIsDiscardPromptOpen(true);
      return;
    }

    onClose();
  };

  return (
    <SmallModal
      isOpen
      onClose={handleRequestClose}
      modalHeader={isDiscardPromptOpen ? translateCommon(["title"]) : title}
      content={
        <>
          {isDiscardPromptOpen && (
            <AreYouSureModal
              onPrimaryBtnClick={() => setIsDiscardPromptOpen(false)}
              onSecondaryBtnClick={onClose}
            />
          )}
          <div className={isDiscardPromptOpen ? "hidden" : "contents"}>
            <div className="flex flex-col w-full h-full justify-between gap-2 -mt-3 max-h-[calc(100vh-10rem)]">
              {children}
              <div className="flex flex-row justify-end gap-[1rem]">
                <ButtonV2
                  variant="tertiary"
                  type="button"
                  disabled={isPending || isSubmitting}
                  onClick={handleRequestClose}
                  icon={<CloseIcon />}
                  iconPosition="end"
                  aria-label={cancelAriaLabel}
                >
                  {translateText(["cancel"])}
                </ButtonV2>
                <ButtonV2
                  variant="primary"
                  type="button"
                  onClick={onSave}
                  disabled={isPending || isSubmitting || !isDirty}
                  isLoading={isPending}
                  aria-label={saveAriaLabel}
                >
                  {translateText(["save"])}
                </ButtonV2>
              </div>
            </div>
          </div>
        </>
      }
    />
  );
};

export default LogActivityModal;
