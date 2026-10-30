import {
  ButtonV2,
  CalendarIcon,
  CloseIcon,
  DatePicker,
  Dropdown,
  InputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { DateTime } from "luxon";
import { FC, useEffect } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import LogCallOwnerField from "~community/crm/components/molecules/LogCallModalForm/LogCallOwnerField";
import { CALL_TIME_OPTIONS } from "~community/crm/constants/callConstants";
import { CrmLogMeetingFormValues } from "~community/crm/types/CrmCommonTypes";

interface Props {
  formik: FormikProps<CrmLogMeetingFormValues>;
  isPending: boolean;
  onCancel: () => void;
}

const LogMeetingModalForm: FC<Props> = ({ formik, isPending, onCancel }) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    dirty,
    isSubmitting,
    submitCount,
    setFieldValue,
    submitForm
  } = formik;

  const translateText = useTranslator(
    "crmModule",
    "activities",
    "logMeeting",
    "modal"
  );
  const translateCallText = useTranslator(
    "crmModule",
    "activities",
    "logCall",
    "modal"
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

  const pickedDate = values.date
    ? DateTime.fromISO(values.date).startOf("day").toJSDate()
    : null;

  const handleDateSelect = (date?: Date): void => {
    setFieldValue(
      "date",
      date ? DateTime.fromJSDate(date).startOf("day").toUTC().toISO() : null,
      true
    );
  };

  return (
    <div className="flex flex-col w-full h-full justify-between gap-2 -mt-3 max-h-[calc(100vh-10rem)]">
      <div className="flex flex-col gap-2 overflow-y-auto pr-1">
        <InputField
          id="log-meeting-subject-input"
          name="subject"
          value={values.subject}
          label={translateCallText(["labels", "subject"])}
          placeholder={translateCallText(["placeholders", "subject"])}
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
              label={translateCallText(["labels", "date"])}
              placeholder={translateCallText(["placeholders", "date"])}
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
              options={CALL_TIME_OPTIONS}
              value={values.startTime}
              onChange={(value) => setFieldValue("startTime", value)}
              label={translateText(["labels", "startTime"])}
              placeholder={translateCallText(["placeholders", "time"])}
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
              options={CALL_TIME_OPTIONS}
              value={values.endTime}
              onChange={(value) => setFieldValue("endTime", value)}
              label={translateText(["labels", "endTime"])}
              placeholder={translateCallText(["placeholders", "time"])}
              variant={errors.endTime ? "primary-error" : "primary"}
              errorMessage={errors.endTime}
              className="rounded-lg"
              ariaLabel={translateAria(["endTime"])}
              width="100%"
              scrollToSelected
            />
          </div>
        </div>

        <LogCallOwnerField id="log-meeting-ownerId" formik={formik} />

        <TextArea
          name="comments"
          value={values.comments}
          label={translateCallText(["labels", "comments"])}
          placeholder={translateCallText(["placeholders", "comments"])}
          onChange={handleChange}
          rows={2}
          aria-label={translateAria(["comments"])}
        />
      </div>

      <div className="flex flex-row justify-end gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isPending || isSubmitting}
          onClick={onCancel}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateAria(["cancel"])}
        >
          {translateCallText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={submitForm}
          disabled={isPending || isSubmitting || !dirty}
          isLoading={isPending}
          aria-label={translateAria(["save"])}
        >
          {translateCallText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default LogMeetingModalForm;
