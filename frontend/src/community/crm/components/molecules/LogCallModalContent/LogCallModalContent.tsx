import { FormikHelpers, useFormik } from "formik";
import { FC, useEffect, useMemo } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import {
  instantInZone,
  nowInZone
} from "~community/common/utils/dateTimeUtils";
import { ActivityCallCreatePayload } from "~community/crm/activities/types/activityTypes";
import { useCreateCall } from "~community/crm/api/ActivityApi";
import LogCallModalForm from "~community/crm/components/molecules/LogCallModalForm/LogCallModalForm";
import {
  CALL_TIME_SLOT_MINUTES,
  CALL_TIME_VALUE_FORMAT
} from "~community/crm/constants/callConstants";
import { CrmErrorMessageKeyEnum } from "~community/crm/enums/common";
import { useDefaultCrmOwner } from "~community/crm/hooks/useDefaultCrmOwner";
import { CrmLogCallFormValues } from "~community/crm/types/CrmCommonTypes";
import {
  getCallValidationSchema,
  parseCallDurationToMinutes
} from "~community/crm/utils/callValidations";

interface Props {
  onCancel: () => void;
  onSaved: () => void;
  onDirtyChange: (isDirty: boolean) => void;
  onPendingChange: (isPending: boolean) => void;
}

const LogCallModalContent: FC<Props> = ({
  onCancel,
  onSaved,
  onDirtyChange,
  onPendingChange
}) => {
  const translateText = useTranslator("crmModule");
  const displayZone = useDisplayZone();
  const { setToastMessage } = useToast();

  const defaultOwner = useDefaultCrmOwner();

  const initialValues: CrmLogCallFormValues = useMemo(() => {
    const now = nowInZone(displayZone);
    const slotStart = now.set({
      minute: now.minute - (now.minute % CALL_TIME_SLOT_MINUTES)
    });

    return {
      subject: "",
      date: now.toUTC().toISO(),
      time: slotStart.toFormat(CALL_TIME_VALUE_FORMAT),
      duration: "",
      contactId: null,
      ownerId: defaultOwner ? defaultOwner.employeeId : null,
      comments: "",
      dealId: null,
      companyId: null
    };
  }, [defaultOwner, displayZone]);

  const toPayload = (
    values: CrmLogCallFormValues,
    contactId: number,
    ownerId: number
  ): ActivityCallCreatePayload => {
    const [hour, minute] = values.time.split(":").map(Number);
    const loggedAt = values.date
      ? instantInZone(values.date, displayZone)
          .set({ hour, minute, second: 0, millisecond: 0 })
          .toUTC()
          .toISO()
      : null;
    const comments = values.comments.trim();
    const durationMinutes = values.duration.trim()
      ? parseCallDurationToMinutes(values.duration)
      : null;

    return {
      subject: values.subject.trim(),
      contactId,
      ownerId,
      ...(loggedAt ? { loggedAt } : {}),
      ...(durationMinutes !== null ? { durationMinutes } : {}),
      ...(values.dealId ? { dealId: values.dealId } : {}),
      ...(values.companyId ? { companyId: values.companyId } : {}),
      ...(comments ? { comments } : {})
    };
  };

  const handleSubmit = (
    values: CrmLogCallFormValues,
    helpers: FormikHelpers<CrmLogCallFormValues>
  ): void => {
    if (!values.contactId || !values.ownerId) {
      helpers.setSubmitting(false);
      return;
    }

    createCall(toPayload(values, values.contactId, values.ownerId));
  };

  const formik = useFormik<CrmLogCallFormValues>({
    initialValues,
    validationSchema: getCallValidationSchema(translateText),
    onSubmit: handleSubmit,
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { values, dirty, setSubmitting, setStatus } = formik;

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const handleSuccess = (): void => {
    setSubmitting(false);
    onSaved();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        "activities",
        "logCall",
        "modal",
        "toastMessages",
        "successTitle"
      ]),
      description: translateText([
        "activities",
        "logCall",
        "modal",
        "toastMessages",
        "successDescription"
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
        "logCall",
        "modal",
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

  useEffect(() => {
    onPendingChange(isPending);
  }, [isPending, onPendingChange]);

  return (
    <LogCallModalForm
      formik={formik}
      isPending={isPending}
      onCancel={onCancel}
    />
  );
};

export default LogCallModalContent;
