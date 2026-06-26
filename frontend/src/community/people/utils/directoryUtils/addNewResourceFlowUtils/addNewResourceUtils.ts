import { NextRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";

import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { ToastProps } from "~community/common/types/ToastTypes";
import { isObjectEmpty } from "~community/common/utils/commonUtil";
import { DiscardTypeEnums } from "~community/people/enums/DirectoryEnums";
import { DiscardChangeModalType } from "~community/people/types/EditEmployeeInfoTypes";

interface HandleGoBackProps {
  activeStep: number;
  isDiscardChangesModal: DiscardChangeModalType;
  setIsDiscardChangesModal: Dispatch<SetStateAction<DiscardChangeModalType>>;
  router: NextRouter;
  getEmployeeObject: () => Object;
}

export const handleGoBack = async ({
  activeStep,
  isDiscardChangesModal,
  setIsDiscardChangesModal,
  router,
  getEmployeeObject
}: HandleGoBackProps) => {
  const navigateToDirectory = async () =>
    await router.push(ROUTES.PEOPLE.DIRECTORY);

  const showDiscardModal = () => {
    setIsDiscardChangesModal({
      isModalOpen: true,
      modalType: DiscardTypeEnums.DISCARD_FORM,
      modalOpenedFrom: ""
    });
    return;
  };

  if (isDiscardChangesModal?.isModalOpen) {
    return navigateToDirectory();
  }

  if (activeStep > 0) {
    showDiscardModal();
  }

  if (activeStep === 0) {
    return isObjectEmpty(getEmployeeObject())
      ? navigateToDirectory()
      : showDiscardModal();
  }

  showDiscardModal();
};

interface HandleErrorProps {
  message: string;
  setToastMessage: Dispatch<SetStateAction<ToastProps>>;
  translateError: (key: string[]) => string;
}

export const handleError = ({
  message,
  setToastMessage,
  translateError
}: HandleErrorProps) => {
  setToastMessage({
    toastType: ToastType.ERROR,
    title: translateError(["addResourceError"]),
    open: true,
    description: message
  });
};

interface HandleAddNewResourceSuccess {
  setToastMessage: Dispatch<SetStateAction<ToastProps>>;
  resetEmployeeData: () => void;
  router: NextRouter;
  translateText: (key: string[]) => string;
}

export const handleAddNewResourceSuccess = ({
  setToastMessage,
  resetEmployeeData,
  router,
  translateText
}: HandleAddNewResourceSuccess) => {
  setToastMessage({
    toastType: ToastType.SUCCESS,
    title: translateText(["resourceSuccessMessage"]),
    open: true
  });

  resetEmployeeData();
  void router.push(ROUTES.PEOPLE.DIRECTORY);
};
