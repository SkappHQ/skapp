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
  role?: string;
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
  ids,
  role
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
      role={role}
      modalContentStyles={modalContentStyles}
    >
      {children}
    </Modal>
  );
};

export default ModalController;
