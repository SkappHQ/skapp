import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { FC, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import SwitchRow from "~community/common/components/atoms/SwitchRow/SwitchRow";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import EnableMultiLevelApprovalConfirmModal from "~community/configurations/components/molecules/EnableMultiLevelApprovalConfirmModal/EnableMultiLevelApprovalConfirmModal";
import useConfigurationUnsavedChanges from "~community/configurations/hooks/useConfigurationUnsavedChanges";
import { useUpdateLeaveApprovalConfig } from "~community/leave/api/LeaveApprovalConfigApi";
import useMultiLevelApprovalEnabled from "~community/leave/hooks/useMultiLevelApprovalEnabled";
import { LeaveApprovalConfigType } from "~community/leave/types/LeaveApprovalConfigTypes";

const LeaveApprovalSettings: FC = () => {
  const translateText = useTranslator(
    "configurations",
    "leave",
    "leaveApprovalSection"
  );
  const { setToastMessage } = useToast();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const { isMultiLevelApprovalEnabled, isLoading, isError } =
    useMultiLevelApprovalEnabled();

  const handleSuccess = (): void => {
    formik.resetForm({ values: formik.values });
    setIsConfirmModalOpen(false);
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toasts", "successTitle"]),
      description: translateText(["toasts", "successDescription"])
    });
  };

  const handleError = (): void => {
    formik.resetForm();
    setIsConfirmModalOpen(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toasts", "errorTitle"]),
      description: translateText(["toasts", "errorDescription"])
    });
  };

  const { mutate: updateLeaveApprovalConfig, isPending } =
    useUpdateLeaveApprovalConfig(handleSuccess, handleError);

  const initialValues: LeaveApprovalConfigType = {
    isMultiLevelApprovalEnabled
  };

  const handleSubmit = (values: LeaveApprovalConfigType): void => {
    updateLeaveApprovalConfig(values);
  };

  const formik = useFormik<LeaveApprovalConfigType>({
    enableReinitialize: true,
    initialValues,
    onSubmit: handleSubmit
  });

  useConfigurationUnsavedChanges(formik.dirty);

  const handleMultiLevelApprovalToggle = (checked: boolean): void => {
    formik.setFieldValue("isMultiLevelApprovalEnabled", checked);
  };

  const handleCancel = (): void => {
    formik.resetForm();
  };

  const handleSave = (): void => {
    if (
      formik.values.isMultiLevelApprovalEnabled &&
      !formik.initialValues.isMultiLevelApprovalEnabled
    ) {
      setIsConfirmModalOpen(true);
      return;
    }
    formik.submitForm();
  };

  const handleConfirmModalClose = (): void => {
    setIsConfirmModalOpen(false);
  };

  const handleConfirmEnable = (): void => {
    formik.submitForm();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="subtitle2 text-black">{translateText(["title"])}</h2>
        <p className="body1 text-secondary-text">
          {translateText(["description"])}
        </p>
      </div>
      {isLoading ? (
        <div className="flex animate-pulse items-center justify-between">
          <div className="h-5 w-64 rounded-lg bg-secondary-accent" />
          <div className="h-7 w-14 rounded-full bg-secondary-accent" />
        </div>
      ) : (
        <SwitchRow
          label={translateText(["multiLevelApprovalLabel"])}
          labelId="multi-level-leave-approval"
          checked={formik.values.isMultiLevelApprovalEnabled}
          onChange={handleMultiLevelApprovalToggle}
          disabled={isError || isPending}
        />
      )}
      <div className="flex flex-row gap-3">
        <ButtonV2
          variant="tertiary"
          disabled={!formik.dirty || isPending}
          onClick={handleCancel}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          disabled={!formik.dirty || isPending}
          isLoading={isPending}
          onClick={handleSave}
          icon={<Icon name={IconName.SAVE_ICON} />}
          iconPosition="end"
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
      <EnableMultiLevelApprovalConfirmModal
        isOpen={isConfirmModalOpen}
        isEnabling={isPending}
        onClose={handleConfirmModalClose}
        onConfirm={handleConfirmEnable}
      />
    </div>
  );
};

export default LeaveApprovalSettings;
