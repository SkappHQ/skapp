import { useFormik } from "formik";
import { DateTime } from "luxon";
import { FC, useMemo } from "react";

import { TIME_FORMAT_24_HOUR } from "~community/common/constants/timeConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import { ActivityMeetingCreatePayload } from "~community/crm/activities/types/activityTypes";
import {
  getActivityEndTimeSlot,
  getTimeSlotStart,
  toActivityInstant
} from "~community/crm/activities/utils/activityUtil";
import { useCreateMeeting } from "~community/crm/api/ActivityApi";
import LogActivityModal from "~community/crm/components/molecules/LogActivityModal/LogActivityModal";
import LogMeetingModalForm from "~community/crm/components/molecules/LogMeetingModalForm/LogMeetingModalForm";
import { CrmErrorMessageKeyEnum } from "~community/crm/enums/common";
import { useDefaultCrmOwner } from "~community/crm/hooks/useDefaultCrmOwner";
import {
  CrmActivityPrefill,
  CrmLogMeetingFormValues
} from "~community/crm/types/CrmCommonTypes";
import { getMeetingValidationSchema } from "~community/crm/utils/meetingValidations";

interface Props {
  prefill?: CrmActivityPrefill;
  onClose: () => void;
}

const LogMeetingModalContent: FC<Props> = ({ prefill, onClose }) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logMeeting",
    "modal"
  );
  const { setToastMessage } = useToast();

  const defaultOwner = useDefaultCrmOwner();

  const initialValues: CrmLogMeetingFormValues = useMemo(() => {
    const now = DateTime.now();
    const slotStart = getTimeSlotStart(now);

    return {
      subject: "",
      date: now.startOf("day").toUTC().toISO(),
      startTime: slotStart.toFormat(TIME_FORMAT_24_HOUR),
      endTime: getActivityEndTimeSlot(slotStart).toFormat(TIME_FORMAT_24_HOUR),
      contactIds: prefill && prefill.contactId ? [prefill.contactId] : [],
      ownerId: defaultOwner ? defaultOwner.employeeId : null,
      comments: "",
      dealId: prefill ? prefill.dealId : null,
      companyId: prefill ? prefill.companyId : null
    };
  }, [defaultOwner, prefill]);

  const toPayload = (
    values: CrmLogMeetingFormValues
  ): ActivityMeetingCreatePayload => {
    return {
      name: values.subject.trim(),
      meetingDate: values.date
        ? DateTime.fromISO(values.date).toISODate()
        : null,
      startAt:
        values.date && values.startTime
          ? toActivityInstant(values.date, values.startTime)
          : null,
      endAt:
        values.date && values.endTime
          ? toActivityInstant(values.date, values.endTime)
          : null,
      contactIds: values.contactIds,
      dealId: values.dealId,
      companyId: values.companyId,
      ownerId: values.ownerId,
      comments: values.comments.trim()
    };
  };

  const handleSubmit = (values: CrmLogMeetingFormValues): void => {
    createMeeting(toPayload(values));
  };

  const validationSchema = useMemo(
    () => getMeetingValidationSchema(translateText),
    [translateText]
  );

  const formik = useFormik<CrmLogMeetingFormValues>({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { dirty, isSubmitting, setSubmitting, submitForm } = formik;

  const handleSuccess = (): void => {
    setSubmitting(false);
    onClose();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        "activities",
        "logMeeting",
        "modal",
        "toastMessages",
        "addSuccessTitle"
      ]),
      description: translateText([
        "activities",
        "logMeeting",
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
      CrmErrorMessageKeyEnum.ACTIVITY_MEETING_DEAL_COMPANY_MISMATCH
    ) {
      requestAnimationFrame(() => {
        document.getElementById("log-meeting-deal-input")?.focus();
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
        "logMeeting",
        "modal",
        "toastMessages",
        "errorDescription"
      ]),
      isIcon: true
    });
  };

  const { mutate: createMeeting, isPending } = useCreateMeeting(
    handleSuccess,
    handleError
  );

  return (
    <LogActivityModal
      title={translateText(["activities", "logMeeting", "modal", "title"])}
      isDirty={dirty}
      isPending={isPending}
      isSubmitting={isSubmitting}
      cancelAriaLabel={translateAria(["cancel"])}
      saveAriaLabel={translateAria(["save"])}
      onSave={submitForm}
      onClose={onClose}
    >
      <LogMeetingModalForm formik={formik} />
    </LogActivityModal>
  );
};

export default LogMeetingModalContent;
