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
import ActivityAssociations from "~community/crm/components/molecules/ActivityAssociations/ActivityAssociations";
import ActivityContactField from "~community/crm/components/molecules/ActivityContactField/ActivityContactField";
import ActivityDealField from "~community/crm/components/molecules/ActivityDealField/ActivityDealField";
import ActivityOwnerField from "~community/crm/components/molecules/ActivityOwnerField/ActivityOwnerField";
import ActivityRelatedToField from "~community/crm/components/molecules/ActivityRelatedToField/ActivityRelatedToField";
import { useCrmStore } from "~community/crm/store/store";
import { CrmLogCallFormValues } from "~community/crm/types/CrmCommonTypes";

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

  const contacts = useCrmStore((state) => state.contacts);

  const contactCompanyId = values.contactId
    ? contacts[values.contactId]?.companyId
    : null;

  const [isDealClearedNoticeVisible, setIsDealClearedNoticeVisible] =
    useState(false);

  const isDealMismatch =
    Boolean(status) &&
    status.mismatchedDealId === values.dealId &&
    status.mismatchedContactId === values.contactId;

  const isCompanyMismatch = Boolean(
    values.companyId &&
    contactCompanyId &&
    values.companyId !== contactCompanyId
  );

  const subjectError = touched.subject ? errors.subject : "";
  const durationError = touched.duration ? errors.duration : "";

  const isSubjectInvalid = Boolean(subjectError);
  const isDurationInvalid = Boolean(durationError);

  const pickedDate = values.date ? toPickerDate(values.date) : null;

  const handleDateSelect = (date?: Date): void => {
    setFieldValue("date", date ? toDateFieldValue(date) : null, true);
  };

  return (
    <div className="flex flex-col gap-2">
      <InputField
        id="log-call-subject-input"
        name="subject"
        value={values.subject}
        label={translateText(["logActivity", "labels", "subject"])}
        placeholder={translateText(["logActivity", "placeholders", "subject"])}
        errorMessage={subjectError}
        state={isSubjectInvalid ? "error" : "default"}
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
            <InputField
              role="combobox"
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
        errorMessage={durationError}
        state={isDurationInvalid ? "error" : "default"}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateAria(["duration"])}
        fullWidth
      />

      <div className="flex flex-row items-start gap-[0.625rem]">
        <div className="flex-1">
          <ActivityContactField
            id="log-call-contactId"
            formik={formik}
            label={translateText(["logCall", "modal", "labels", "contact"])}
            fieldAriaLabel={translateAria(["contact"])}
            onDealCleared={() => setIsDealClearedNoticeVisible(true)}
            errorMessage={touched.contactId ? errors.contactId : ""}
            fillsRelatedTo
            required
          />
        </div>
        <div className="flex-1">
          <ActivityOwnerField id="log-call-ownerId" formik={formik} required />
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

      <ActivityAssociations
        formik={formik}
        dealFieldId="log-call-deal"
        relatedToFieldId="log-call-related-to"
        isDealMismatch={isDealMismatch}
        isDealClearedNoticeVisible={isDealClearedNoticeVisible}
        isCompanyMismatch={isCompanyMismatch}
      >
        <ActivityDealField
          id="log-call-deal"
          formik={formik}
          fieldAriaLabel={translateAria(["deal"])}
          isClearedNoticeVisible={isDealClearedNoticeVisible}
          isMismatch={isDealMismatch}
          onDealChange={() => setIsDealClearedNoticeVisible(false)}
          {...(contactCompanyId && { filterCompanyId: contactCompanyId })}
        />
        <ActivityRelatedToField
          id="log-call-related-to"
          formik={formik}
          fieldAriaLabel={translateAria(["relatedTo"])}
          {...(isCompanyMismatch && {
            mismatchMessage: translateText([
              "logActivity",
              "notices",
              "relatedToMismatch"
            ])
          })}
        />
      </ActivityAssociations>
    </div>
  );
};

export default LogCallModalForm;
