import { SxProps } from "@mui/material";
import { FC, MouseEvent, ReactElement } from "react";

import Modal from "~community/common/components/organisms/Modal/Modal";

interface props {
  children: ReactElement;
  modalTitle: string;
  isModalOpen: boolean;
  isClosable?: boolean;
  isDividerVisible?: boolean;
  handleCloseModal: () => void;
  setModalType?: (value: any) => void;
  modalContentStyles?: SxProps;
  modalWrapperStyles?: SxProps;
  ids?: {
    title?: string;
    description?: string;
    closeButton?: string;
  };
}

const ModalController: FC<props> = ({
  children,
  modalTitle,
  isModalOpen,
  isClosable,
  isDividerVisible,
  handleCloseModal,
  setModalType,
  modalContentStyles,
  modalWrapperStyles,
  ids
}) => {
  const onCloseModal = (
    _event: MouseEvent<HTMLButtonElement>,
    reason: string
  ): void => {
    if (reason === "backdropClick") {
      setModalType?.("NONE");
    }
    handleCloseModal?.();
  };

  return (
    <Modal
      isModalOpen={isModalOpen}
      onCloseModal={onCloseModal}
      ids={ids}
      title={modalTitle}
      isClosable={isClosable}
      isDividerVisible={isDividerVisible}
      modalWrapperStyles={modalWrapperStyles}
      modalContentStyles={modalContentStyles}
    >
      {children}
    </Modal>
  );
};

export default ModalController;
