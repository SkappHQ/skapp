import { FormikHelpers, useFormik } from "formik";
import { DateTime } from "luxon";
import { FC, useMemo } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ACTIVITY_TIME_VALUE_FORMAT } from "~community/crm/activities/constants/activityConstants";
import { ActivityMeetingCreatePayload } from "~community/crm/activities/types/activityTypes";
import {
  getTimeSlotStart,
  toActivityInstant
} from "~community/crm/activities/utils/activityUtil";
import { useCreateMeeting } from "~community/crm/api/ActivityApi";
import LogActivityModal from "~community/crm/components/molecules/LogActivityModal/LogActivityModal";
import LogMeetingModalForm from "~community/crm/components/molecules/LogMeetingModalForm/LogMeetingModalForm";
import { useDefaultCrmOwner } from "~community/crm/hooks/useDefaultCrmOwner";
import { CrmLogMeetingFormValues } from "~community/crm/types/CrmCommonTypes";
import { getMeetingValidationSchema } from "~community/crm/utils/meetingValidations";

interface Props {
  onClose: () => void;
}

const LogMeetingModalContent: FC<Props> = ({ onClose }) => {
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
      date: now.toUTC().toISO(),
      startTime: slotStart.toFormat(ACTIVITY_TIME_VALUE_FORMAT),
      endTime: slotStart
        .plus({ hours: 1 })
        .toFormat(ACTIVITY_TIME_VALUE_FORMAT),
      contactIds: [],
      ownerId: defaultOwner ? defaultOwner.employeeId : null,
      comments: "",
      dealId: null,
      companyId: null
    };
  }, [defaultOwner]);

  const toPayload = (
    values: CrmLogMeetingFormValues,
    date: string,
    ownerId: number
  ): ActivityMeetingCreatePayload => {
    return {
      name: values.subject.trim(),
      meetingDate: DateTime.fromISO(date).toISODate(),
      startAt: toActivityInstant(date, values.startTime),
      endAt: toActivityInstant(date, values.endTime),
      contactIds: values.contactIds,
      dealId: values.dealId,
      companyId: values.companyId,
      ownerId,
      comments: values.comments.trim()
    };
  };

  const handleSubmit = (
    values: CrmLogMeetingFormValues,
    helpers: FormikHelpers<CrmLogMeetingFormValues>
  ): void => {
    if (!values.date || !values.ownerId) {
      helpers.setSubmitting(false);
      return;
    }

    createMeeting(toPayload(values, values.date, values.ownerId));
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
  };

  const handleError = (): void => {
    setSubmitting(false);
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
