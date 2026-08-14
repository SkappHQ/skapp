import { useCallback, useEffect } from "react";

import { useUploadImages } from "~community/common/api/FileHandleApi";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { convertToYYYYMMDDFromDateTime } from "~community/common/utils/dateTimeUtils";
import { useApplyPolicyLeave } from "~community/leave/api/PolicyLeaveApi";
import {
  PolicyLeaveModalEnums,
  PolicyLeaveToastEnums
} from "~community/leave/enums/PolicyLeaveEnums";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { uploadPolicyLeaveAttachments } from "~community/leave/utils/policyLeave/policyLeaveAttachmentUtils";
import {
  getPolicyLeaveFormErrors,
  handlePolicyLeaveToast,
  hasPolicyLeaveFormErrors,
  mapApplyErrorKeyToToastType
} from "~community/leave/utils/policyLeave/policyLeaveUtils";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface Props {
  availabilityError: string;
}

interface ApplyPolicyLeaveSubmit {
  submitPolicyLeave: () => Promise<void>;
  isApplyPending: boolean;
}

const useApplyPolicyLeaveSubmit = ({
  availabilityError
}: Props): ApplyPolicyLeaveSubmit => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "applyPolicyLeaveModal"
  );

  const { setToastMessage } = useToast();
  const environment = useGetEnvironment();
  const { sendEvent } = useGoogleAnalyticsEvent();

  const {
    selectedYear,
    selectedPolicyBalance,
    selectedDates,
    selectedDuration,
    comment,
    attachments,
    formErrors,
    setFormErrors,
    setModalType
  } = usePolicyLeaveStore((state) => ({
    selectedYear: state.selectedYear,
    selectedPolicyBalance: state.selectedPolicyBalance,
    selectedDates: state.selectedDates,
    selectedDuration: state.selectedDuration,
    comment: state.comment,
    attachments: state.attachments,
    formErrors: state.formErrors,
    setFormErrors: state.setFormErrors,
    setModalType: state.setModalType
  }));

  const { mutateAsync: uploadAttachments } = useUploadImages();

  const onApplySuccess = (): void => {
    handlePolicyLeaveToast({
      type: PolicyLeaveToastEnums.APPLY_SUCCESS,
      setToastMessage,
      translateText
    });
    sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_APPLIED);
    setModalType(PolicyLeaveModalEnums.NONE);
  };

  const onApplyError = (messageKey: string): void => {
    handlePolicyLeaveToast({
      type: mapApplyErrorKeyToToastType(messageKey),
      setToastMessage,
      translateText
    });
  };

  const { mutate: applyPolicyLeave, isPending: isApplyPending } =
    useApplyPolicyLeave(selectedYear, onApplySuccess, onApplyError);

  const validate = useCallback((): boolean => {
    const errors = getPolicyLeaveFormErrors({
      selectedDatesLength: selectedDates.length,
      comment,
      attachments,
      policyBalance: selectedPolicyBalance,
      availabilityError,
      translateText
    });

    setFormErrors(errors);

    return !hasPolicyLeaveFormErrors(errors);
  }, [
    selectedDates.length,
    comment,
    attachments,
    selectedPolicyBalance,
    availabilityError,
    translateText,
    setFormErrors
  ]);

  useEffect(() => {
    if (hasPolicyLeaveFormErrors(formErrors)) {
      validate();
    }
  }, [selectedDates, comment, attachments]);

  const submitPolicyLeave = async (): Promise<void> => {
    if (!selectedPolicyBalance || !validate()) {
      return;
    }

    try {
      const attachmentRefs = await uploadPolicyLeaveAttachments({
        attachments,
        environment,
        uploadAttachments
      });

      applyPolicyLeave({
        policyId: selectedPolicyBalance.policyId,
        startDate: convertToYYYYMMDDFromDateTime(selectedDates[0]),
        endDate: convertToYYYYMMDDFromDateTime(
          selectedDates[1] ?? selectedDates[0]
        ),
        leaveState: selectedDuration,
        requestDesc: comment,
        attachments: attachmentRefs
      });
    } catch {
      handlePolicyLeaveToast({
        type: PolicyLeaveToastEnums.APPLY_ERROR,
        setToastMessage,
        translateText
      });
    }
  };

  return { submitPolicyLeave, isApplyPending };
};

export default useApplyPolicyLeaveSubmit;
