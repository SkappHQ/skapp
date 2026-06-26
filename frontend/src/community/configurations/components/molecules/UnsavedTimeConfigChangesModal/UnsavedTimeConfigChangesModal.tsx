import React from "react";

import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";

interface UnsavedTimeConfigChangesModalProps {
  isOpen: boolean;
  onLeave: () => void;
  onResume: () => void;
  title: string;
  content: string;
}

const UnsavedTimeConfigChangesModal: React.FC<
  UnsavedTimeConfigChangesModalProps
> = ({ isOpen, onLeave, onResume, title }) => {
  return (
    <Modal
      isModalOpen={isOpen}
      onCloseModal={onResume}
      title={title}
      isClosable={false}
      modalWrapperStyles={{
        zIndex: ZIndexEnums.MODAL
      }}
    >
      <AreYouSureModal
        onPrimaryBtnClick={onResume}
        onSecondaryBtnClick={onLeave}
      />
    </Modal>
  );
};

export default UnsavedTimeConfigChangesModal;
