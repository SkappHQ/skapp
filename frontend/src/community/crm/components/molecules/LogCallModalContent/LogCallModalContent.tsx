import { useFormik } from "formik";
import { DateTime } from "luxon";
import { FC, ReactNode, useMemo } from "react";

import { TIME_FORMAT_24_HOUR } from "~community/common/constants/timeConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import { ActivityCallCreatePayload } from "~community/crm/activities/types/activityTypes";
import {
  getTimeSlotStart,
  toActivityInstant
} from "~community/crm/activities/utils/activityUtil";
import { useCreateCall } from "~community/crm/api/ActivityApi";
import LogActivityModal from "~community/crm/components/molecules/LogActivityModal/LogActivityModal";
import LogCallModalForm from "~community/crm/components/molecules/LogCallModalForm/LogCallModalForm";
import { CrmErrorMessageKeyEnum } from "~community/crm/enums/common";
import { useDefaultCrmOwner } from "~community/crm/hooks/useDefaultCrmOwner";
import { CrmLogCallFormValues } from "~community/crm/types/CrmCommonTypes";
import {
  getCallValidationSchema,
  parseCallDurationToMinutes
} from "~community/crm/utils/callValidations";

interface Props {
  title?: string;
  typeField?: ReactNode;
  onClose: () => void;
}

const LogCallModalContent: FC<Props> = ({ title, typeField, onClose }) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logCall",
    "modal"
  );
  const { setToastMessage } = useToast();

  const defaultOwner = useDefaultCrmOwner();

  const initialValues: CrmLogCallFormValues = useMemo(() => {
    const now = DateTime.now();

    return {
      subject: "",
      date: now.startOf("day").toUTC().toISO(),
      time: getTimeSlotStart(now).toFormat(TIME_FORMAT_24_HOUR),
      duration: "",
      contactId: null,
      ownerId: defaultOwner ? defaultOwner.employeeId : null,
      comments: "",
      dealId: null,
      companyId: null
    };
  }, [defaultOwner]);

  const toPayload = (
    values: CrmLogCallFormValues
  ): ActivityCallCreatePayload => {
    return {
      subject: values.subject.trim(),
      loggedAt:
        values.date && values.time
          ? toActivityInstant(values.date, values.time)
          : null,
      durationMinutes: parseCallDurationToMinutes(values.duration),
      contactId: values.contactId,
      ownerId: values.ownerId,
      dealId: values.dealId,
      companyId: values.companyId,
      comments: values.comments.trim()
    };
  };

  const handleSubmit = (values: CrmLogCallFormValues): void => {
    createCall(toPayload(values));
  };

  const validationSchema = useMemo(
    () => getCallValidationSchema(translateText),
    [translateText]
  );

  const formik = useFormik<CrmLogCallFormValues>({
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
        "logCall",
        "modal",
        "toastMessages",
        "addSuccessTitle"
      ]),
      description: translateText([
        "activities",
        "logCall",
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
      CrmErrorMessageKeyEnum.ACTIVITY_CALL_DEAL_COMPANY_MISMATCH
    ) {
      setStatus({
        mismatchedDealId: values.dealId,
        mismatchedContactId: values.contactId
      });
      requestAnimationFrame(() => {
        document.getElementById("log-call-deal-input")?.focus();
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
        "logCall",
        "modal",
        "toastMessages",
        "errorDescription"
      ]),
      isIcon: true
    });
  };

  const { mutate: createCall, isPending } = useCreateCall(
    handleSuccess,
    handleError
  );

  return (
    <LogActivityModal
      title={
        title
          ? title
          : translateText(["activities", "logCall", "modal", "title"])
      }
      isDirty={dirty}
      isPending={isPending}
      isSubmitting={isSubmitting}
      cancelAriaLabel={translateAria(["cancel"])}
      saveAriaLabel={translateAria(["save"])}
      onSave={submitForm}
      onClose={onClose}
    >
      {typeField}
      <LogCallModalForm formik={formik} />
    </LogActivityModal>
  );
};

export default LogCallModalContent;
