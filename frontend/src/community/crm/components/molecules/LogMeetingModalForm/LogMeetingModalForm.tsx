import {
  CalendarIcon,
  DatePicker,
  Dropdown,
  InputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC, useEffect } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  getActivityTimeOptions,
  toDateFieldValue,
  toPickerDate
} from "~community/crm/activities/utils/activityUtil";
import ActivityOwnerField from "~community/crm/components/molecules/ActivityOwnerField/ActivityOwnerField";
import { CrmLogMeetingFormValues } from "~community/crm/types/CrmCommonTypes";

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
    </div>
  );
};

export default LogMeetingModalForm;
