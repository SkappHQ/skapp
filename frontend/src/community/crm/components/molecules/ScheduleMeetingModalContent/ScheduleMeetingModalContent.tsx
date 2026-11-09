import { useFormik } from "formik";
import { DateTime } from "luxon";
import { FC, useMemo, useState } from "react";
import * as Yup from "yup";

import { TIME_FORMAT_24_HOUR } from "~community/common/constants/timeConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  ActivityMeetingOverlapResponse,
  ActivityMeetingSchedulePayload
} from "~community/crm/activities/types/activityTypes";
import {
  getActivityEndTimeSlot,
  getTimeSlotStart,
  toActivityInstant
} from "~community/crm/activities/utils/activityUtil";
import {
  useCheckMeetingOverlaps,
  useScheduleMeeting
} from "~community/crm/api/ActivityApi";
import AddToGoogleCalendarModal from "~community/crm/components/molecules/AddToGoogleCalendarModal/AddToGoogleCalendarModal";
import LogActivityModal from "~community/crm/components/molecules/LogActivityModal/LogActivityModal";
import ScheduleMeetingModalForm from "~community/crm/components/molecules/ScheduleMeetingModalForm/ScheduleMeetingModalForm";
import { CrmMeetingVenueEnum } from "~community/crm/enums/common";
import { useDefaultCrmOwner } from "~community/crm/hooks/useDefaultCrmOwner";
import { CrmScheduleMeetingFormValues } from "~community/crm/types/CrmCommonTypes";
import { getMeetingValidationSchema } from "~community/crm/utils/meetingValidations";

interface Props {
  onClose: () => void;
}

const ScheduleMeetingModalContent: FC<Props> = ({ onClose }) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "scheduleMeeting",
    "modal"
  );
  const { setToastMessage } = useToast();

  const defaultOwner = useDefaultCrmOwner();

  const initialValues: CrmScheduleMeetingFormValues = useMemo(() => {
    const now = DateTime.now();
    const slotStart = getTimeSlotStart(now);

    return {
      subject: "",
      date: now.startOf("day").toUTC().toISO(),
      startTime: slotStart.toFormat(TIME_FORMAT_24_HOUR),
      endTime: getActivityEndTimeSlot(slotStart).toFormat(TIME_FORMAT_24_HOUR),
      meetingVenue: CrmMeetingVenueEnum.ONLINE,
      location: "",
      locationUrl: "",
      contactIds: [],
      ownerId: defaultOwner ? defaultOwner.employeeId : null,
      comments: "",
      dealId: null,
      companyId: null
    };
  }, [defaultOwner]);

  const toPayload = (
    values: CrmScheduleMeetingFormValues
  ): ActivityMeetingSchedulePayload => {
    const isInPerson = values.meetingVenue === CrmMeetingVenueEnum.IN_PERSON;

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
      meetingVenue: values.meetingVenue,
      location: isInPerson ? values.location.trim() : null,
      locationAddress: null,
      locationUrl: isInPerson && values.locationUrl ? values.locationUrl : null,
      contactIds: values.contactIds,
      dealId: values.dealId,
      companyId: values.companyId,
      ownerId: values.ownerId,
      comments: values.comments.trim()
    };
  };

  const [pendingMeeting, setPendingMeeting] =
    useState<ActivityMeetingSchedulePayload | null>(null);
  const [overlaps, setOverlaps] = useState<ActivityMeetingOverlapResponse[]>(
    []
  );

  const handleSubmit = (values: CrmScheduleMeetingFormValues): void => {
    const payload = toPayload(values);
    setPendingMeeting(payload);
    checkMeetingOverlaps({
      startAt: payload.startAt,
      endAt: payload.endAt,
      ownerId: payload.ownerId
    });
  };

  const validationSchema = useMemo(
    () =>
      getMeetingValidationSchema(translateText).shape({
        location: Yup.string().when("meetingVenue", {
          is: CrmMeetingVenueEnum.IN_PERSON,
          then: (schema) =>
            schema
              .trim()
              .required(
                translateText([
                  "activities",
                  "scheduleMeeting",
                  "modal",
                  "validations",
                  "location"
                ])
              )
        })
      }),
    [translateText]
  );

  const formik = useFormik<CrmScheduleMeetingFormValues>({
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
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        "activities",
        "scheduleMeeting",
        "modal",
        "toastMessages",
        "addSuccessTitle"
      ]),
      description: translateText([
        "activities",
        "scheduleMeeting",
        "modal",
        "toastMessages",
        "addSuccessDescription"
      ])
    });
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
        "scheduleMeeting",
        "modal",
        "toastMessages",
        "errorDescription"
      ]),
      isIcon: true
    });
  };

  const { mutate: scheduleMeeting, isPending } = useScheduleMeeting(
    handleSuccess,
    handleError
  );

  const handleOverlapsChecked = (
    overlappingMeetings: ActivityMeetingOverlapResponse[]
  ): void => {
    setSubmitting(false);
    setOverlaps(overlappingMeetings);
  };

  const handleOverlapCheckError = (): void => {
    setSubmitting(false);
    setPendingMeeting(null);
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
        "scheduleMeeting",
        "addToCalendarModal",
        "overlapCheckErrorDescription"
      ]),
      isIcon: true
    });
  };

  const {
    mutate: checkMeetingOverlaps,
    isPending: isCheckingOverlaps,
    isSuccess: isOverlapCheckDone,
    reset: resetOverlapCheck
  } = useCheckMeetingOverlaps(handleOverlapsChecked, handleOverlapCheckError);

  const handleBackToForm = (): void => {
    if (isPending) return;
    setPendingMeeting(null);
    setOverlaps([]);
    resetOverlapCheck();
  };

  const handleConfirmSchedule = (): void => {
    if (isPending || !pendingMeeting) return;
    scheduleMeeting(pendingMeeting);
    onClose();
    setToastMessage({
      open: true,
      toastType: ToastType.INFO,
      title: translateText([
        "activities",
        "scheduleMeeting",
        "modal",
        "toastMessages",
        "syncingTitle"
      ]),
      description: translateText([
        "activities",
        "scheduleMeeting",
        "modal",
        "toastMessages",
        "syncingDescription"
      ])
    });
  };

  if (pendingMeeting && isOverlapCheckDone) {
    return (
      <AddToGoogleCalendarModal
        meeting={pendingMeeting}
        overlaps={overlaps}
        isPending={isPending}
        onBack={handleBackToForm}
        onConfirm={handleConfirmSchedule}
        onClose={onClose}
      />
    );
  }

  return (
    <LogActivityModal
      title={translateText(["activities", "scheduleMeeting", "modal", "title"])}
      isDirty={dirty}
      isPending={isCheckingOverlaps}
      isSubmitting={isSubmitting}
      cancelAriaLabel={translateAria(["cancel"])}
      saveAriaLabel={translateAria(["save"])}
      onSave={submitForm}
      onClose={onClose}
    >
      <ScheduleMeetingModalForm formik={formik} />
    </LogActivityModal>
  );
};

export default ScheduleMeetingModalContent;
