import { useFormik } from "formik";
import { DateTime } from "luxon";
import { FC, useMemo } from "react";

import { TIME_FORMAT_24_HOUR } from "~community/common/constants/timeConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import { ActivityEmailCreatePayload } from "~community/crm/activities/types/activityTypes";
import {
  getTimeSlotStart,
  toActivityInstant
} from "~community/crm/activities/utils/activityUtil";
import { useCreateEmail } from "~community/crm/api/ActivityApi";
import LogActivityModal from "~community/crm/components/molecules/LogActivityModal/LogActivityModal";
import LogEmailModalForm from "~community/crm/components/molecules/LogEmailModalForm/LogEmailModalForm";
import { CrmErrorMessageKeyEnum } from "~community/crm/enums/common";
import {
  CrmActivityPrefill,
  CrmLogEmailFormValues
} from "~community/crm/types/CrmCommonTypes";
import { getEmailValidationSchema } from "~community/crm/utils/emailValidations";

interface Props {
  prefill?: CrmActivityPrefill;
  onClose: () => void;
}

const LogEmailModalContent: FC<Props> = ({ prefill, onClose }) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logEmail",
    "modal"
  );
  const { setToastMessage } = useToast();

  const initialValues: CrmLogEmailFormValues = useMemo(() => {
    const now = DateTime.now();

    return {
      fromAddress: "",
      date: now.startOf("day").toUTC().toISO(),
      time: getTimeSlotStart(now).toFormat(TIME_FORMAT_24_HOUR),
      toContactIds: prefill && prefill.contactId ? [prefill.contactId] : [],
      ccContactIds: [],
      bccContactIds: [],
      subject: "",
      dealId: prefill ? prefill.dealId : null,
      companyId: prefill ? prefill.companyId : null,
      description: ""
    };
  }, [prefill]);

  const toPayload = (
    values: CrmLogEmailFormValues
  ): ActivityEmailCreatePayload => {
    const fromAddress = values.fromAddress.trim();

    return {
      fromAddress: fromAddress.length > 0 ? fromAddress : null,
      loggedAt:
        values.date && values.time
          ? toActivityInstant(values.date, values.time)
          : null,
      toContactIds: values.toContactIds,
      ccContactIds: values.ccContactIds,
      bccContactIds: values.bccContactIds,
      subject: values.subject.trim(),
      dealId: values.dealId,
      companyId: values.companyId,
      description: values.description.trim()
    };
  };

  const handleSubmit = (values: CrmLogEmailFormValues): void => {
    createEmail(toPayload(values));
  };

  const validationSchema = useMemo(
    () => getEmailValidationSchema(translateText),
    [translateText]
  );

  const formik = useFormik<CrmLogEmailFormValues>({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    validateOnChange: false,
    validateOnBlur: true
  });

  const { dirty, isSubmitting, setSubmitting, submitForm } = formik;

  const handleSuccess = (): void => {
    setSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        "activities",
        "logEmail",
        "modal",
        "toastMessages",
        "addSuccessTitle"
      ]),
      description: translateText([
        "activities",
        "logEmail",
        "modal",
        "toastMessages",
        "addSuccessDescription"
      ])
    });
    onClose();
  };

  const handleError = (error: ErrorResponse): void => {
    setSubmitting(false);

    const messageKey = error.response?.data?.results?.[0]?.messageKey;

    if (
      messageKey === CrmErrorMessageKeyEnum.ACTIVITY_EMAIL_DEAL_COMPANY_MISMATCH
    ) {
      requestAnimationFrame(() => {
        document.getElementById("log-email-deal-input")?.focus();
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
        "logEmail",
        "modal",
        "toastMessages",
        "errorDescription"
      ]),
      isIcon: true
    });
  };

  const { mutate: createEmail, isPending } = useCreateEmail(
    handleSuccess,
    handleError
  );

  return (
    <LogActivityModal
      title={translateText(["activities", "logEmail", "modal", "title"])}
      isDirty={dirty}
      isPending={isPending}
      isSubmitting={isSubmitting}
      cancelAriaLabel={translateAria(["cancel"])}
      saveAriaLabel={translateAria(["save"])}
      onSave={submitForm}
      onClose={onClose}
    >
      <LogEmailModalForm formik={formik} />
    </LogActivityModal>
  );
};

export default LogEmailModalContent;
