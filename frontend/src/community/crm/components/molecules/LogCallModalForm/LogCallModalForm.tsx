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
import { useCrmStore } from "~community/crm/store/store";
import { CrmLogCallFormValues } from "~community/crm/types/CrmCommonTypes";

import LogCallContactField from "./LogCallContactField";

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

  const contacts = useCrmStore((state) => state.contacts);

  const contactCompanyId = values.contactId
    ? contacts[values.contactId]?.companyId
    : null;

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
            options={getActivityTimeOptions()}
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

      <ActivityAssociations
        isOpen={isAssociationsVisible}
        onToggle={() => setIsAssociationsOpen(!isAssociationsVisible)}
      >
        <ActivityDealField
          id="log-call-deal"
          formik={formik}
          fieldAriaLabel={translateAria(["deal"])}
          clearedNoticeText={translateText(["notices", "dealCleared"])}
          isClearedNoticeVisible={isDealClearedNoticeVisible}
          onDealChange={() => setIsDealClearedNoticeVisible(false)}
          {...(contactCompanyId && { filterCompanyId: contactCompanyId })}
          {...(isDealMismatch && {
            errorMessage: translateText(["validations", "dealMismatch"])
          })}
        />
        <ActivityRelatedToField
          id="log-call-related-to"
          formik={formik}
          fieldAriaLabel={translateAria(["relatedTo"])}
        />
      </ActivityAssociations>
    </div>
  );
};

export default LogCallModalForm;
