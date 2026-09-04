import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useShallow } from "zustand/react/shallow";

import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useAddPolicyLeaveType,
  useUpdatePolicyLeaveType
} from "~community/leave/api/PolicyLeaveTypeApi";
import { useLeaveStore } from "~community/leave/store/store";
import {
  PolicyLeaveTypeFormDataType,
  PolicyLeaveTypePayloadType
} from "~community/leave/types/PolicyLeaveTypeTypes";
import {
  getPolicyLeaveTypeErrorToastKeys,
  mapPolicyLeaveTypeFormToPayload
} from "~community/leave/utils/policyLeaveTypes/policyLeaveTypeUtils";
import { QuickSetupModalTypeEnums } from "~enterprise/common/enums/Common";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface Props {
  isEditMode: boolean;
  policyLeaveTypeId: number;
}

interface PolicyLeaveTypeFormSubmit {
  submitPolicyLeaveType: (formValues: PolicyLeaveTypeFormDataType) => void;
  isSubmitting: boolean;
}

const usePolicyLeaveTypeFormSubmit = ({
  isEditMode,
  policyLeaveTypeId
}: Props): PolicyLeaveTypeFormSubmit => {
  const translateText = useTranslator("leaveModule", "leaveTypes");

  const router = useRouter();

  const { setToastMessage } = useToast();

  const { sendEvent } = useGoogleAnalyticsEvent();

  const { setLeaveTypeFormDirty } = useLeaveStore(
    useShallow((state) => ({
      setLeaveTypeFormDirty: state.setLeaveTypeFormDirty
    }))
  );

  const {
    ongoingQuickSetup,
    setQuickSetupModalType,
    stopAllOngoingQuickSetup
  } = useCommonEnterpriseStore(
    useShallow((state) => ({
      ongoingQuickSetup: state.ongoingQuickSetup,
      setQuickSetupModalType: state.setQuickSetupModalType,
      stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
    }))
  );

  const onMutationSuccess = async (isEdit: boolean) => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        isEdit
          ? "editLeaveTypeSuccessToastTitle"
          : "addLeaveTypeSuccessToastTitle"
      ]),
      description: translateText([
        isEdit
          ? "editLeaveTypeSuccessToastDescription"
          : "addLeaveTypeSuccessToastDescription"
      ]),
      isIcon: true
    });

    setLeaveTypeFormDirty(false);

    await router.push(ROUTES.LEAVE.LEAVE_TYPES);

    if (!isEdit && ongoingQuickSetup.SETUP_LEAVE_TYPES) {
      setQuickSetupModalType(QuickSetupModalTypeEnums.IN_PROGRESS_START_UP);
      stopAllOngoingQuickSetup();
    }

    sendEvent(
      isEdit
        ? GoogleAnalyticsTypes.GA4_LEAVE_TYPE_UPDATED
        : GoogleAnalyticsTypes.GA4_LEAVE_TYPE_CREATED
    );
  };

  const onMutationError = (error: AxiosError) => {
    const { title, description } = getPolicyLeaveTypeErrorToastKeys(error);

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([title]),
      description: translateText([description]),
      isIcon: true
    });
  };

  const { mutate: addPolicyLeaveType, isPending: isAddPending } =
    useAddPolicyLeaveType(() => onMutationSuccess(false), onMutationError);

  const { mutate: updatePolicyLeaveType, isPending: isUpdatePending } =
    useUpdatePolicyLeaveType(() => onMutationSuccess(true), onMutationError);

  const submitPolicyLeaveType = (
    formValues: PolicyLeaveTypeFormDataType
  ): void => {
    const payload: PolicyLeaveTypePayloadType =
      mapPolicyLeaveTypeFormToPayload(formValues);

    if (isEditMode && policyLeaveTypeId) {
      updatePolicyLeaveType({ id: policyLeaveTypeId, payload });
      return;
    }

    addPolicyLeaveType(payload);
  };

  return {
    submitPolicyLeaveType,
    isSubmitting: isAddPending || isUpdatePending
  };
};

export default usePolicyLeaveTypeFormSubmit;
