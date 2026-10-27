import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import LogCallModalForm from "~community/crm/components/molecules/LogCallModalForm/LogCallModalForm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LogCallModal: FC<Props> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("crmModule");

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={translateText(["activities", "logCall", "modal", "title"])}
      content={<LogCallModalForm onCancel={onClose} />}
    />
  );
};

export default LogCallModal;
