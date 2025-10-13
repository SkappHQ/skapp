import { Box } from "@mui/material";
import { useFormik } from "formik";
import React, { Dispatch, SetStateAction, useEffect } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { LEAVE_ERROR_NUMBER_OF_DAYS_CANNOT_BE_LESS_THAN_USED_DAYS } from "~community/common/constants/errorMessageKeys";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useUpdateLeaveAllocation } from "~community/leave/api/LeaveApi";
import CustomLeaveAllocationForm from "~community/leave/components/molecules/CustomLeaveAllocationForm/CustomLeaveAllocationForm";
import { useLeaveStore } from "~community/leave/store/store";
import {
  CustomLeaveAllocationModalTypes,
  CustomLeaveAllocationType
} from "~community/leave/types/CustomLeaveAllocationTypes";
import { customLeaveAllocationValidation } from "~community/leave/utils/validations";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface Props {
  setCurrentLeaveAllocationFormData: Dispatch<
    SetStateAction<CustomLeaveAllocationType | undefined>
  >;
  onDelete: () => void;
  initialValues: CustomLeaveAllocationType;
}

const EditLeaveAllocationModal: React.FC<Props> = ({
  setCurrentLeaveAllocationFormData,
  initialValues,
  onDelete
}) => {
  const translateText = useTranslator("leaveModule", "customLeave");

  const { setToastMessage } = useToast();

  const {
    setCustomLeaveAllocationModalType,
    setIsLeaveAllocationModalOpen,
    currentEditingLeaveAllocation
  } = useLeaveStore((state) => ({
    setCustomLeaveAllocationModalType: state.setCustomLeaveAllocationModalType,
    setIsLeaveAllocationModalOpen: state.setIsLeaveAllocationModalOpen,
    currentEditingLeaveAllocation: state.currentEditingLeaveAllocation
  }));

  const { sendEvent } = useGoogleAnalyticsEvent();

  const onUpdateSuccess = () => {
    setIsLeaveAllocationModalOpen(false);
    setCustomLeaveAllocationModalType(
      CustomLeaveAllocationModalTypes.EDIT_LEAVE_ALLOCATION
    );
    setToastMessage({
      open: true,
      toastType: "success",
      title: translateText(["updateSuccessTitle"]),
      description: translateText(["updateSuccessDescription"]),
      isIcon: true
    });
    sendEvent(GoogleAnalyticsTypes.GA4_CUSTOM_ALLOCATION_UPDATED);
  };

  const onUpdateError = (error: string) => {
    if (error === LEAVE_ERROR_NUMBER_OF_DAYS_CANNOT_BE_LESS_THAN_USED_DAYS) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["updateErrorTitle"]),
        description: translateText(["updateErrorDescription"]),
        isIcon: true
      });
    }
  };

  const {
    mutate: updateLeaveAllocation,
    isPending: isLeaveAllocationUpdatePending
  } = useUpdateLeaveAllocation(onUpdateSuccess, onUpdateError);

  const onSubmit = (values: CustomLeaveAllocationType) => {
    updateLeaveAllocation({
      employeeId: currentEditingLeaveAllocation?.employeeId ?? 0,
      typeId: Number(values.typeId),
      numberOfDaysOff: Number(values.numberOfDaysOff),
      entitlementId: currentEditingLeaveAllocation?.entitlementId
        ? Number(currentEditingLeaveAllocation.entitlementId)
        : 0,
      validFromDate: values?.validFromDate,
      validToDate: values?.validToDate
    });
  };

  const {
    values,
    errors,
    handleSubmit,
    setFieldValue,
    setFieldError,
    isSubmitting
  } = useFormik({
    initialValues: {
      assignedTo:
        initialValues.assignedTo || currentEditingLeaveAllocation?.assignedTo,
      entitlementId: initialValues.entitlementId
        ? Number(initialValues.entitlementId)
        : Number(currentEditingLeaveAllocation?.entitlementId),
      employeeId: initialValues.employeeId
        ? Number(initialValues.employeeId)
        : Number(currentEditingLeaveAllocation?.employeeId),
      typeId: initialValues.typeId
        ? Number(initialValues.typeId)
        : Number(currentEditingLeaveAllocation?.typeId),
      numberOfDaysOff: initialValues.numberOfDaysOff
        ? Number(initialValues.numberOfDaysOff)
        : Number(currentEditingLeaveAllocation?.numberOfDaysOff),
      validToDate:
        initialValues.validToDate || currentEditingLeaveAllocation?.validToDate,
      validFromDate:
        initialValues.validFromDate ||
        currentEditingLeaveAllocation?.validFromDate
    },
    validationSchema: customLeaveAllocationValidation(translateText),
    onSubmit,
    enableReinitialize: true
  });

  useEffect(() => {
    setCurrentLeaveAllocationFormData(values);
  }, [values, setCurrentLeaveAllocationFormData]);

  const isDeleteDisabled = currentEditingLeaveAllocation?.totalDaysUsed != 0;

  const isSaveDisabled =
    !values.employeeId ||
    !values.typeId ||
    !values.numberOfDaysOff ||
    isSubmitting ||
    isLeaveAllocationUpdatePending;

  return (
    <>
      <CustomLeaveAllocationForm
        values={values}
        errors={errors}
        setFieldValue={setFieldValue}
        setFieldError={setFieldError}
        translateText={translateText}
        onSubmit={handleSubmit}
        datesDisabled={isDeleteDisabled}
      />
      <Box sx={{ mt: "1rem" }}>
        <Button
          label={translateText(["saveChangesBtn"])}
          styles={{ mt: "1rem" }}
          buttonStyle={ButtonStyle.PRIMARY}
          endIcon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          onClick={() => onSubmit(values)}
          disabled={isSaveDisabled}
        />
        <Button
          label={translateText(["deleteBtnText"])}
          styles={{ mt: "1rem" }}
          buttonStyle={ButtonStyle.ERROR}
          endIcon={<Icon name={IconName.DELETE_BUTTON_ICON} />}
          onClick={onDelete}
          disabled={isDeleteDisabled}
        />
      </Box>
    </>
  );
};

export default EditLeaveAllocationModal;
