import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FormikHelpers, useFormik } from "formik";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import SwitchRow from "~community/common/components/atoms/SwitchRow/SwitchRow";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import useConfigurationUnsavedChanges from "~community/configurations/hooks/useConfigurationUnsavedChanges";
import {
  useGetLeaveApprovalConfig,
  useUpdateLeaveApprovalConfig
} from "~community/leave/api/LeaveApprovalConfigApi";
import { LeaveApprovalConfigType } from "~community/leave/types/LeaveApprovalConfigTypes";

const LeaveApprovalSettings: FC = () => {
  const translateText = useTranslator(
    "configurations",
    "leave",
    "leaveApprovalSection"
  );
  const { setToastMessage } = useToast();

  const { data: leaveApprovalConfig, isLoading } = useGetLeaveApprovalConfig();

  const handleSuccess = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toasts", "successTitle"]),
      description: translateText(["toasts", "successDescription"])
    });
  };

  const handleError = (): void => {
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
    isMultiLevelApprovalEnabled: Boolean(
      leaveApprovalConfig?.isMultiLevelApprovalEnabled
    )
  };

  const handleSubmit = (
    values: LeaveApprovalConfigType,
    { resetForm }: FormikHelpers<LeaveApprovalConfigType>
  ): void => {
    updateLeaveApprovalConfig(values, { onError: () => resetForm() });
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
    </div>
  );
};

export default LeaveApprovalSettings;
