import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FormikHelpers, useFormik } from "formik";
import { DateTime } from "luxon";
import { FC, useMemo, useState } from "react";

import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ActivityMeetingCreatePayload } from "~community/crm/activities/types/activityTypes";
import { useCreateMeeting } from "~community/crm/api/ActivityApi";
import LogMeetingModalForm from "~community/crm/components/molecules/LogMeetingModalForm/LogMeetingModalForm";
import {
  CALL_TIME_SLOT_MINUTES,
  CALL_TIME_VALUE_FORMAT
} from "~community/crm/constants/callConstants";
import { useDefaultCrmOwner } from "~community/crm/hooks/useDefaultCrmOwner";
import { CrmLogMeetingFormValues } from "~community/crm/types/CrmCommonTypes";
import { getMeetingValidationSchema } from "~community/crm/utils/meetingValidations";

interface Props {
  onClose: () => void;
}

const LogMeetingModalContent: FC<Props> = ({ onClose }) => {
  const translateText = useTranslator("crmModule");
  const translateCommon = useTranslator(
    "commonComponents",
    "userPromptModal",
    "unsavedChangesModal"
  );
  const { setToastMessage } = useToast();

  const [isDiscardPromptOpen, setIsDiscardPromptOpen] = useState(false);

  const defaultOwner = useDefaultCrmOwner();

  const initialValues: CrmLogMeetingFormValues = useMemo(() => {
    const now = DateTime.now();
    const slotStart = now.set({
      minute: now.minute - (now.minute % CALL_TIME_SLOT_MINUTES)
    });

    return {
      subject: "",
      date: now.toUTC().toISO(),
      startTime: slotStart.toFormat(CALL_TIME_VALUE_FORMAT),
      endTime: slotStart.plus({ hours: 1 }).toFormat(CALL_TIME_VALUE_FORMAT),
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
    const meetingDate = DateTime.fromISO(date);

    const toInstant = (time: string): string | null => {
      if (!time) return null;

      const { hour, minute } = DateTime.fromFormat(
        time,
        CALL_TIME_VALUE_FORMAT
      );

      return meetingDate
        .set({ hour, minute })
        .startOf("minute")
        .toUTC()
        .toISO();
    };

    return {
      name: values.subject.trim(),
      meetingDate: meetingDate.toISODate(),
      startAt: toInstant(values.startTime),
      endAt: toInstant(values.endTime),
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

  const { dirty, setSubmitting } = formik;

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
        "logCall",
        "modal",
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

  const handleRequestClose = (): void => {
    if (isPending) return;

    if (dirty && !isDiscardPromptOpen) {
      setIsDiscardPromptOpen(true);
      return;
    }

    onClose();
  };

  return (
    <SmallModal
      isOpen
      onClose={handleRequestClose}
      modalHeader={
        isDiscardPromptOpen
          ? translateCommon(["title"])
          : translateText(["activities", "logMeeting", "modal", "title"])
      }
      content={
        <>
          {isDiscardPromptOpen && (
            <AreYouSureModal
              onPrimaryBtnClick={() => setIsDiscardPromptOpen(false)}
              onSecondaryBtnClick={onClose}
            />
          )}
          <div className={isDiscardPromptOpen ? "hidden" : "contents"}>
            <LogMeetingModalForm
              formik={formik}
              isPending={isPending}
              onCancel={handleRequestClose}
            />
          </div>
        </>
      }
    />
  );
};

export default LogMeetingModalContent;
