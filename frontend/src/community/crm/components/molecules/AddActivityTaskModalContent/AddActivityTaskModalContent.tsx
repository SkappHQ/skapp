import { useFormik } from "formik";
import { FC, useMemo } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import { ActivityTaskCreatePayload } from "~community/crm/activities/types/activityTypes";
import { useCreateTask } from "~community/crm/api/ActivityApi";
import AddActivityTaskModalForm from "~community/crm/components/molecules/AddActivityTaskModalForm/AddActivityTaskModalForm";
import LogActivityModal from "~community/crm/components/molecules/LogActivityModal/LogActivityModal";
import {
  CrmErrorMessageKeyEnum,
  CrmPriorityEnum
} from "~community/crm/enums/common";
import { useDefaultCrmOwner } from "~community/crm/hooks/useDefaultCrmOwner";
import { CrmAddTaskFormValues } from "~community/crm/types/CrmCommonTypes";
import { getActivityTaskValidationSchema } from "~community/crm/utils/activityTaskValidations";

interface Props {
  onClose: () => void;
}

const AddActivityTaskModalContent: FC<Props> = ({ onClose }) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "addTask",
    "modal"
  );
  const { setToastMessage } = useToast();

  const defaultOwner = useDefaultCrmOwner();

  const initialValues: CrmAddTaskFormValues = useMemo(
    () => ({
      name: "",
      priority: CrmPriorityEnum.MEDIUM,
      dueAt: null,
      ownerId: defaultOwner ? defaultOwner.employeeId : null,
      contactId: null,
      dealId: null,
      companyId: null,
      notes: ""
    }),
    [defaultOwner]
  );

  const toPayload = (
    values: CrmAddTaskFormValues
  ): ActivityTaskCreatePayload => {
    return {
      name: values.name.trim(),
      priority: values.priority,
      dueAt: values.dueAt,
      ownerId: values.ownerId,
      contactId: values.contactId,
      dealId: values.dealId,
      companyId: values.companyId,
      notes: values.notes.trim()
    };
  };

  const handleSubmit = (values: CrmAddTaskFormValues): void => {
    createTask(toPayload(values));
  };

  const validationSchema = useMemo(
    () => getActivityTaskValidationSchema(translateText),
    [translateText]
  );

  const formik = useFormik<CrmAddTaskFormValues>({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { values, dirty, isSubmitting, setSubmitting, setStatus, submitForm } =
    formik;

  const handleSuccess = (): void => {
    setSubmitting(false);
    onClose();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        "activities",
        "addTask",
        "modal",
        "toastMessages",
        "addSuccessTitle"
      ]),
      description: translateText([
        "activities",
        "addTask",
        "modal",
        "toastMessages",
        "addSuccessDescription"
      ])
    });
  };

  const handleError = (error: ErrorResponse): void => {
    setSubmitting(false);

    if (
      error.response?.data?.results?.[0]?.messageKey ===
      CrmErrorMessageKeyEnum.TASK_DEAL_COMPANY_MISMATCH
    ) {
      setStatus({
        mismatchedDealId: values.dealId,
        mismatchedContactId: values.contactId
      });
      requestAnimationFrame(() => {
        document.getElementById("add-task-deal-input")?.focus();
      });
      return;
    }

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([
        "activities",
        "logActivity",
        "toastMessages",
        "errorTitle"
      ]),
      description: translateText([
        "activities",
        "addTask",
        "modal",
        "toastMessages",
        "errorDescription"
      ]),
      isIcon: true
    });
  };

  const { mutate: createTask, isPending } = useCreateTask(
    handleSuccess,
    handleError
  );

  return (
    <LogActivityModal
      title={translateText(["activities", "addTask", "modal", "title"])}
      isDirty={dirty}
      isPending={isPending}
      isSubmitting={isSubmitting}
      cancelAriaLabel={translateAria(["cancel"])}
      saveAriaLabel={translateAria(["save"])}
      onSave={submitForm}
      onClose={onClose}
    >
      <AddActivityTaskModalForm formik={formik} />
    </LogActivityModal>
  );
};

export default AddActivityTaskModalContent;
