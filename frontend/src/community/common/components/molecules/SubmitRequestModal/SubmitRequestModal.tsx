import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SubmitRequestModal: React.FC<Props> = ({ isOpen, onClose }) => {
const translateText = useTranslator("commonComponents", "submitRequestModal");

  return (
    <Modal
      isModalOpen={isOpen}
      onCloseModal={onClose}
      title={translateText(["title"])}
      icon={<Icon name={IconName.CLOSE_STATUS_POPUP_ICON} />}
    >
      <></>
    </Modal>
  );
};

export default SubmitRequestModal;
