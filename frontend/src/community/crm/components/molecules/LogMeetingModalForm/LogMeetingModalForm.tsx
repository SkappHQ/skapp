import {
  CalendarIcon,
  DatePicker,
  Dropdown,
  InputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC, useEffect, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  getActivityTimeOptions,
  toDateFieldValue,
  toPickerDate
} from "~community/crm/activities/utils/activityUtil";
import ActivityAssociations from "~community/crm/components/molecules/ActivityAssociations/ActivityAssociations";
import ActivityDealField from "~community/crm/components/molecules/ActivityDealField/ActivityDealField";
import ActivityOwnerField from "~community/crm/components/molecules/ActivityOwnerField/ActivityOwnerField";
import ActivityRelatedToField from "~community/crm/components/molecules/ActivityRelatedToField/ActivityRelatedToField";
import MeetingAttendeesField from "~community/crm/components/molecules/MeetingAttendeesField/MeetingAttendeesField";
import { useCrmStore } from "~community/crm/store/store";
import { CrmLogMeetingFormValues } from "~community/crm/types/CrmCommonTypes";
import { getContactCompanyIds } from "~community/crm/utils/contactUtil";

interface Props {
  formik: FormikProps<CrmLogMeetingFormValues>;
}

const LogMeetingModalForm: FC<Props> = ({ formik }) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isSubmitting,
    submitCount,
    setFieldValue
  } = formik;

  const translateText = useTranslator(
    "crmModule",
    "activities",
    "logMeeting",
    "modal"
  );
  const translateActivityText = useTranslator(
    "crmModule",
    "activities",
    "logActivity"
  );
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logMeeting",
    "modal"
  );

  const contacts = useCrmStore((state) => state.contacts);

  const [isAssociationsOpen, setIsAssociationsOpen] = useState(false);
  const [isDealClearedNoticeVisible, setIsDealClearedNoticeVisible] =
    useState(false);

  const handleDealCleared = (): void => {
    setIsDealClearedNoticeVisible(true);
    setIsAssociationsOpen(true);
  };

  const attendeeCompanyIds = Array.from(
    new Set(getContactCompanyIds(contacts, values.contactIds))
  );

  useEffect(() => {
    if (submitCount === 0 || isSubmitting) return;

    const [firstInvalidField] = Object.keys(errors);

    if (firstInvalidField) {
      document
        .getElementById(`log-meeting-${firstInvalidField}-input`)
        ?.focus();
    }
  }, [submitCount, isSubmitting]);

  const pickedDate = values.date ? toPickerDate(values.date) : null;

  const handleDateSelect = (date?: Date): void => {
    setFieldValue("date", date ? toDateFieldValue(date) : null, true);
  };

  return (
    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
      <InputField
        id="log-meeting-subject-input"
        name="subject"
        value={values.subject}
        label={translateActivityText(["labels", "subject"])}
        placeholder={translateActivityText(["placeholders", "subject"])}
        {...(touched.subject && { errorMessage: errors.subject })}
        state={touched.subject && errors.subject ? "error" : "default"}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateAria(["subject"])}
        fullWidth
        required
      />

      <DatePicker
        mode="single"
        {...(pickedDate && { selected: pickedDate })}
        onSelect={handleDateSelect}
        popperProps={{ position: "bottom-start", isFlip: true }}
      >
        <div>
          <InputField
            id="log-meeting-date-input"
            name="date"
            value={pickedDate ? pickedDate.toLocaleDateString() : ""}
            label={translateActivityText(["labels", "date"])}
            placeholder={translateActivityText(["placeholders", "date"])}
            errorMessage={errors.date}
            state={errors.date ? "error" : "default"}
            aria-label={translateAria(["date"])}
            rightIcon={<CalendarIcon />}
            fullWidth
            readOnly
            required
          />
        </div>
      </DatePicker>

      <div className="flex flex-row items-start gap-[0.625rem]">
        <div className="flex-1">
          <Dropdown
            id="log-meeting-startTime-input"
            options={getActivityTimeOptions()}
            value={values.startTime}
            onChange={(value) => setFieldValue("startTime", value)}
            label={translateText(["labels", "startTime"])}
            placeholder={translateActivityText(["placeholders", "time"])}
            variant="primary"
            className="rounded-lg"
            ariaLabel={translateAria(["startTime"])}
            width="100%"
            scrollToSelected
          />
        </div>
        <div className="flex-1">
          <Dropdown
            id="log-meeting-endTime-input"
            options={getActivityTimeOptions()}
            value={values.endTime}
            onChange={(value) => setFieldValue("endTime", value)}
            label={translateText(["labels", "endTime"])}
            placeholder={translateActivityText(["placeholders", "time"])}
            variant={errors.endTime ? "primary-error" : "primary"}
            errorMessage={errors.endTime}
            className="rounded-lg"
            ariaLabel={translateAria(["endTime"])}
            width="100%"
            scrollToSelected
          />
        </div>
      </div>

      <MeetingAttendeesField
        id="log-meeting-contactIds"
        formik={formik}
        onDealCleared={handleDealCleared}
      />

      <ActivityOwnerField id="log-meeting-ownerId" formik={formik} />

      <TextArea
        name="comments"
        value={values.comments}
        label={translateActivityText(["labels", "comments"])}
        placeholder={translateActivityText(["placeholders", "comments"])}
        onChange={handleChange}
        rows={2}
        aria-label={translateAria(["comments"])}
      />

      <ActivityAssociations
        isOpen={isAssociationsOpen}
        onToggle={() => setIsAssociationsOpen(!isAssociationsOpen)}
      >
        <ActivityDealField
          id="log-meeting-deal"
          formik={formik}
          fieldAriaLabel={translateAria(["deal"])}
          clearedNoticeText={translateText(["notices", "dealCleared"])}
          isClearedNoticeVisible={isDealClearedNoticeVisible}
          onDealChange={() => setIsDealClearedNoticeVisible(false)}
          {...(attendeeCompanyIds.length === 1 && {
            filterCompanyId: attendeeCompanyIds[0]
          })}
        />
        <ActivityRelatedToField
          id="log-meeting-related-to"
          formik={formik}
          fieldAriaLabel={translateAria(["relatedTo"])}
        />
      </ActivityAssociations>
    </div>
  );
};

export default LogMeetingModalForm;
