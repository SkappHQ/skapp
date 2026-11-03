import {
  CalendarIcon,
  DatePicker,
  Dropdown,
  InputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  getActivityTimeOptions,
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
    setFieldValue
  } = formik;

  const translateText = useTranslator("crmModule", "activities");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logCall",
    "modal"
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

  const pickedDate = values.date ? toPickerDate(values.date) : null;

  const handleDateSelect = (date?: Date): void => {
    setFieldValue("date", date ? toDateFieldValue(date) : null, true);
  };

  return (
    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
      <InputField
        id="log-call-subject-input"
        name="subject"
        value={values.subject}
        label={translateText(["logActivity", "labels", "subject"])}
        placeholder={translateText(["logActivity", "placeholders", "subject"])}
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
                label={translateText(["logActivity", "labels", "date"])}
                placeholder={translateText([
                  "logActivity",
                  "placeholders",
                  "date"
                ])}
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
            options={getActivityTimeOptions()}
            value={values.time}
            onChange={(value) => setFieldValue("time", value)}
            label={translateText(["logCall", "modal", "labels", "time"])}
            placeholder={translateText(["logActivity", "placeholders", "time"])}
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
        label={translateText(["logCall", "modal", "labels", "duration"])}
        placeholder={translateText([
          "logCall",
          "modal",
          "placeholders",
          "duration"
        ])}
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
        label={translateText(["logActivity", "labels", "comments"])}
        placeholder={translateText(["logActivity", "placeholders", "comments"])}
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
                ? translateText([
                    "logCall",
                    "modal",
                    "validations",
                    "dealMismatch"
                  ])
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
          ? translateText(["logCall", "modal", "buttons", "hideAssociations"])
          : translateText(["logCall", "modal", "buttons", "addAssociations"])}
      </button>
    </div>
  );
};

export default LogCallModalForm;
