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
import { FC, useEffect, useState } from "react";

import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  instantToPickedDay,
  pickedDayToInstant
} from "~community/common/utils/dateTimeUtils";
import { CALL_TIME_OPTIONS } from "~community/crm/constants/callConstants";
import { CrmLogCallFormValues } from "~community/crm/types/CrmCommonTypes";

import LogCallCompanyField from "./LogCallCompanyField";
import LogCallContactField from "./LogCallContactField";
import LogCallDealField from "./LogCallDealField";
import LogCallOwnerField from "./LogCallOwnerField";

const FIELD_FOCUS_ORDER: {
  field: keyof CrmLogCallFormValues;
  elementId: string;
}[] = [
  { field: "subject", elementId: "log-call-subject" },
  { field: "duration", elementId: "log-call-duration" },
  { field: "contactId", elementId: "log-call-contact-input" },
  { field: "ownerId", elementId: "log-call-owner-input" }
];

interface Props {
  formik: FormikProps<CrmLogCallFormValues>;
  onCancel: () => void;
}

const LogCallModalForm: FC<Props> = ({ formik, onCancel }) => {
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
    "logCall",
    "modal"
  );
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logCall",
    "modal"
  );
  const displayZone = useDisplayZone();

  const [isAssociationsOpen, setIsAssociationsOpen] = useState(false);
  const [isDealClearedNoticeVisible, setIsDealClearedNoticeVisible] =
    useState(false);

  const handleDealCleared = (): void => {
    setIsDealClearedNoticeVisible(true);
    setIsAssociationsOpen(true);
  };

  useEffect(() => {
    if (submitCount === 0 || isSubmitting) return;

    const firstInvalidField = FIELD_FOCUS_ORDER.find(
      ({ field }) => errors[field]
    );

    if (firstInvalidField) {
      document.getElementById(firstInvalidField.elementId)?.focus();
    }
  }, [submitCount, isSubmitting]);

  const pickedDate = values.date
    ? instantToPickedDay(values.date, displayZone)
    : null;

  const handleDateSelect = (date?: Date) => {
    setFieldValue(
      "date",
      date ? pickedDayToInstant(date, displayZone) : null,
      true
    );
  };

  return (
    <div className="flex flex-col w-full h-full justify-between gap-2 -mt-3 max-h-[calc(100vh-10rem)]">
      <div className="flex flex-col gap-2 overflow-y-auto pr-1">
        <InputField
          id="log-call-subject"
          name="subject"
          value={values.subject}
          label={translateText(["labels", "subject"])}
          placeholder={translateText(["placeholders", "subject"])}
          errorMessage={touched.subject ? errors.subject : ""}
          state={touched.subject && errors.subject ? "error" : "default"}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-label={translateAria(["subject"])}
          fullWidth
          required
        />

        <div className="flex flex-row items-start gap-[0.625rem]">
          <div className="flex-1">
            <DatePicker
              mode="single"
              {...(pickedDate && { selected: pickedDate })}
              onSelect={handleDateSelect}
              popperProps={{ position: "bottom-start", isFlip: true }}
            >
              <div>
                <InputField
                  name="date"
                  value={pickedDate ? pickedDate.toLocaleDateString() : ""}
                  label={translateText(["labels", "date"])}
                  placeholder={translateText(["placeholders", "date"])}
                  aria-label={translateAria(["date"])}
                  rightIcon={<CalendarIcon />}
                  fullWidth
                  readOnly
                />
              </div>
            </DatePicker>
          </div>
          <div className="flex-1">
            <Dropdown
              options={CALL_TIME_OPTIONS}
              value={values.time}
              onChange={(value) => setFieldValue("time", value)}
              label={translateText(["labels", "time"])}
              placeholder={translateText(["placeholders", "time"])}
              variant="primary"
              className="rounded-lg"
              ariaLabel={translateAria(["time"])}
              width="100%"
              scrollToSelected
            />
          </div>
        </div>

        <InputField
          id="log-call-duration"
          name="duration"
          value={values.duration}
          label={translateText(["labels", "duration"])}
          placeholder={translateText(["placeholders", "duration"])}
          errorMessage={touched.duration ? errors.duration : ""}
          state={touched.duration && errors.duration ? "error" : "default"}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-label={translateAria(["duration"])}
          fullWidth
        />

        <div className="flex flex-row items-start gap-[0.625rem]">
          <div className="flex-1">
            <LogCallContactField
              id="log-call-contact"
              formik={formik}
              onDealCleared={handleDealCleared}
            />
          </div>
          <div className="flex-1">
            <LogCallOwnerField id="log-call-owner" formik={formik} />
          </div>
        </div>

        <TextArea
          name="comments"
          value={values.comments}
          label={translateText(["labels", "comments"])}
          placeholder={translateText(["placeholders", "comments"])}
          onChange={handleChange}
          rows={2}
          aria-label={translateAria(["comments"])}
        />

        {isAssociationsOpen && (
          <>
            <LogCallDealField
              id="log-call-deal"
              formik={formik}
              isClearedNoticeVisible={isDealClearedNoticeVisible}
              onDealChange={() => setIsDealClearedNoticeVisible(false)}
            />
            <LogCallCompanyField id="log-call-related-to" formik={formik} />
          </>
        )}

        <button
          type="button"
          className="self-start text-sm text-primary-text underline"
          aria-expanded={isAssociationsOpen}
          onClick={() => setIsAssociationsOpen((open) => !open)}
        >
          {isAssociationsOpen
            ? translateText(["buttons", "hideAssociations"])
            : translateText(["buttons", "addAssociations"])}
        </button>
      </div>

      <div className="flex flex-row justify-end gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateAria(["cancel"])}
        >
          {translateText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={submitForm}
          disabled={isSubmitting || !dirty}
          aria-label={translateAria(["save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default LogCallModalForm;
