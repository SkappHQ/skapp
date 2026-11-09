import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import CrmDeleteModalContent from "~community/crm/components/molecules/CrmDeleteModalContent/CrmDeleteModalContent";

interface Props {
  isOpen: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteActivityModal: FC<Props> = ({
  isOpen,
  isPending,
  onConfirm,
  onClose
}) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "activitySidePanel",
    "deleteModal"
  );
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "activitySidePanel",
    "deleteModal"
  );

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={translateText(["title"])}
      content={
        <CrmDeleteModalContent
          description={translateText(["description"])}
          isPending={isPending}
          confirmLabel={translateText(["buttons", "confirm"])}
          cancelLabel={translateText(["buttons", "cancel"])}
          confirmAriaLabel={translateAria(["confirm"])}
          cancelAriaLabel={translateAria(["cancel"])}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      }
    />
  );
};

export default DeleteActivityModal;
