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
import { ACTIVITY_TIME_OPTIONS } from "~community/crm/activities/constants/activityConstants";
import {
  toDateFieldValue,
  toPickerDate
} from "~community/crm/activities/utils/activityUtil";
import ActivityOwnerField from "~community/crm/components/molecules/ActivityOwnerField/ActivityOwnerField";
import { CrmLogCallFormValues } from "~community/crm/types/CrmCommonTypes";

import LogCallCompanyField from "./LogCallCompanyField";
import LogCallContactField from "./LogCallContactField";
import LogCallDealField from "./LogCallDealField";

interface Props {
  formik: FormikProps<CrmLogCallFormValues>;
}

const LogCallModalForm: FC<Props> = ({ formik }) => {
  const {
    values,
    errors,
    status,
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
    "logCall",
    "modal"
  );
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logCall",
    "modal"
  );
  const translateActivityText = useTranslator(
    "crmModule",
    "activities",
    "logActivity"
  );

  const [isAssociationsOpen, setIsAssociationsOpen] = useState(false);
  const [isDealClearedNoticeVisible, setIsDealClearedNoticeVisible] =
    useState(false);

  const isDealMismatch =
    Boolean(status) &&
    status.mismatchedDealId === values.dealId &&
    status.mismatchedContactId === values.contactId;

  const isAssociationsVisible = isAssociationsOpen || isDealMismatch;

  const handleDealCleared = (): void => {
    setIsDealClearedNoticeVisible(true);
    setIsAssociationsOpen(true);
  };

  useEffect(() => {
    if (submitCount === 0 || isSubmitting) return;

    const [firstInvalidField] = Object.keys(errors);

    if (firstInvalidField) {
      document.getElementById(`log-call-${firstInvalidField}-input`)?.focus();
    }
  }, [submitCount, isSubmitting]);

  const pickedDate = toPickerDate(values.date);

  const handleDateSelect = (date?: Date): void => {
    setFieldValue("date", toDateFieldValue(date), true);
  };

  return (
    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
      <InputField
        id="log-call-subject-input"
        name="subject"
        value={values.subject}
        label={translateActivityText(["labels", "subject"])}
        placeholder={translateActivityText(["placeholders", "subject"])}
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
                label={translateActivityText(["labels", "date"])}
                placeholder={translateActivityText(["placeholders", "date"])}
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
            options={ACTIVITY_TIME_OPTIONS}
            value={values.time}
            onChange={(value) => setFieldValue("time", value)}
            label={translateText(["labels", "time"])}
            placeholder={translateActivityText(["placeholders", "time"])}
            variant="primary"
            className="rounded-lg"
            ariaLabel={translateAria(["time"])}
            width="100%"
            scrollToSelected
          />
        </div>
      </div>

      <InputField
        id="log-call-duration-input"
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
            id="log-call-contactId"
            formik={formik}
            onDealCleared={handleDealCleared}
          />
        </div>
        <div className="flex-1">
          <ActivityOwnerField id="log-call-ownerId" formik={formik} />
        </div>
      </div>

      <TextArea
        name="comments"
        value={values.comments}
        label={translateActivityText(["labels", "comments"])}
        placeholder={translateActivityText(["placeholders", "comments"])}
        onChange={handleChange}
        rows={2}
        aria-label={translateAria(["comments"])}
      />

      {isAssociationsVisible && (
        <>
          <LogCallDealField
            id="log-call-deal"
            formik={formik}
            errorMessage={
              isDealMismatch
                ? translateText(["validations", "dealMismatch"])
                : ""
            }
            isClearedNoticeVisible={isDealClearedNoticeVisible}
            onDealChange={() => setIsDealClearedNoticeVisible(false)}
          />
          <LogCallCompanyField id="log-call-related-to" formik={formik} />
        </>
      )}

      <button
        type="button"
        className="self-start text-sm text-primary-text underline"
        aria-expanded={isAssociationsVisible}
        onClick={() => setIsAssociationsOpen(!isAssociationsVisible)}
      >
        {isAssociationsVisible
          ? translateText(["buttons", "hideAssociations"])
          : translateText(["buttons", "addAssociations"])}
      </button>
    </div>
  );
};

export default LogCallModalForm;
