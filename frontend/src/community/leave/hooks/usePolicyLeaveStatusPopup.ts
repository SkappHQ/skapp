import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { STATUS_POPUP_TYPES } from "~community/leave/constants/policyLeaveReviewConstants";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import { PolicyLeavePopupType } from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";

interface Props {
  isOpen: boolean;
  requestStatus: PolicyLeaveRequestStatus | undefined;
  onClose: () => void;
}

interface PolicyLeaveStatusPopup {
  popupType: PolicyLeavePopupType;
  setPopupType: Dispatch<SetStateAction<PolicyLeavePopupType>>;
  closePopup: () => void;
}

const usePolicyLeaveStatusPopup = ({
  isOpen,
  requestStatus,
  onClose
}: Props): PolicyLeaveStatusPopup => {
  const [popupType, setPopupType] = useState<PolicyLeavePopupType>(
    PolicyLeaveReviewModalEnums.NONE
  );

  useEffect(() => {
    if (!isOpen || !requestStatus) {
      return;
    }

    setPopupType((currentPopupType) =>
      currentPopupType === PolicyLeaveReviewModalEnums.NONE
        ? (STATUS_POPUP_TYPES.find((status) => status === requestStatus) ??
          PolicyLeaveReviewModalEnums.NONE)
        : currentPopupType
    );
  }, [requestStatus, isOpen]);

  const closePopup = (): void => {
    setPopupType(PolicyLeaveReviewModalEnums.NONE);
    onClose();
  };

  return { popupType, setPopupType, closePopup };
};

export default usePolicyLeaveStatusPopup;
