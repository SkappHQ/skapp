import { ArrowRightIcon, ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo
} from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useCreateLeaveAllocation } from "~community/leave/api/LeaveApi";
import { useLeaveStore } from "~community/leave/store/store";
import {
  CustomLeaveAllocationModalTypes,
  CustomLeaveAllocationType
} from "~community/leave/types/CustomLeaveAllocationTypes";
import { customLeaveAllocationValidation } from "~community/leave/utils/validations";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

import CustomLeaveAllocationForm from "../../CustomLeaveAllocationForm/CustomLeaveAllocationForm";

interface Props {
  setTempLeaveAllocationDetails: Dispatch<
    SetStateAction<CustomLeaveAllocationType | undefined>
  >;
  setCurrentLeaveAllocationFormData: Dispatch<
    SetStateAction<CustomLeaveAllocationType | undefined>
  >;
  isEditingLeaveAllocationChanged: boolean;
  initialValues: CustomLeaveAllocationType;
  onCancel: (values: CustomLeaveAllocationType) => void;
}
const AddLeaveAllocationModal: React.FC<Props> = ({
  setCurrentLeaveAllocationFormData,
  initialValues,
  onCancel
}) => {
  const translateText = useTranslator("leaveModule", "customLeave");
  const { setCustomLeaveAllocationModalType, setIsLeaveAllocationModalOpen } =
    useLeaveStore();

  const { setToastMessage } = useToast();

  const { sendEvent } = useGoogleAnalyticsEvent();

  const onAddSuccess = useCallback(() => {
    setIsLeaveAllocationModalOpen(false);
    setCustomLeaveAllocationModalType(
      CustomLeaveAllocationModalTypes.ADD_LEAVE_ALLOCATION
    );
    setToastMessage({
      open: true,
      toastType: "success",
      title: translateText(["customLeaveAllocationSuccessTitle"]),
      description: translateText(["customLeaveAllocationSuccessDes"]),
      isIcon: true
    });
    sendEvent(GoogleAnalyticsTypes.GA4_CUSTOM_ALLOCATION_ADDED);
  }, [setIsLeaveAllocationModalOpen, setCustomLeaveAllocationModalType]);

  const onAddError = useCallback(() => {
    setToastMessage({
      open: true,
      toastType: "error",
      title: translateText(["customLeaveAllocationFailTitle"]),
      description: translateText(["customLeaveAllocationFailDes"]),
      isIcon: true
    });
  }, []);

  const { mutate, isPending } = useCreateLeaveAllocation(
    onAddSuccess,
    onAddError
  );

  const onSubmit = async (
    values: CustomLeaveAllocationType,
    onAddSuccess: () => void,
    onAddError: () => void
  ) => {
    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (!hasErrors) {
      mutate(values, {
        onSuccess: onAddSuccess,
        onError: onAddError
      });
    }
  };

  const validationSchema = useMemo(
    () => customLeaveAllocationValidation(translateText),
    [translateText]
  );

  const form = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      onSubmit(values, onAddSuccess, onAddError);
    },
    enableReinitialize: true,
    validateOnChange: false
  });

  const {
    values,
    errors,
    handleSubmit,
    setFieldValue,
    setFieldError,
    isSubmitting
  } = form;

  useEffect(() => {
    setCurrentLeaveAllocationFormData(values);
  }, [values, setCurrentLeaveAllocationFormData]);

  const isSaveDisabled =
    !values.assignedTo ||
    !values.employeeId ||
    !values.typeId ||
    !values.numberOfDaysOff ||
    isPending;

  return (
    <>
      <CustomLeaveAllocationForm
        values={values}
        errors={errors}
        setFieldValue={setFieldValue}
        setFieldError={setFieldError}
        translateText={translateText}
        onSubmit={handleSubmit}
      />
      <div className="flex flex-row justify-end gap-3 mt-4">
        <ButtonV2
          variant={"tertiary"}
          onClick={() => onCancel(values)}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["cancelBtn"])}
        </ButtonV2>
        <ButtonV2
          variant={"primary"}
          onClick={() => onSubmit(values, onAddSuccess, onAddError)}
          disabled={isSaveDisabled}
          icon={<ArrowRightIcon />}
          iconPosition="end"
        >
          {translateText(["saveBtn"])}
        </ButtonV2>
      </div>
    </>
  );
};

export default AddLeaveAllocationModal;
