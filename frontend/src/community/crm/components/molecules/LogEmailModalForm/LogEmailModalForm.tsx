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
import ActivityContactsField from "~community/crm/components/molecules/ActivityContactsField/ActivityContactsField";
import ActivityDealField from "~community/crm/components/molecules/ActivityDealField/ActivityDealField";
import ActivityRelatedToField from "~community/crm/components/molecules/ActivityRelatedToField/ActivityRelatedToField";
import { CrmLogEmailFormValues } from "~community/crm/types/CrmCommonTypes";

interface Props {
  formik: FormikProps<CrmLogEmailFormValues>;
}

const LogEmailModalForm: FC<Props> = ({ formik }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  const translateText = useTranslator("crmModule", "activities");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logEmail",
    "modal"
  );

  const [isAssociationsOpen, setIsAssociationsOpen] = useState(false);

  const pickedDate = values.date ? toPickerDate(values.date) : null;

  const handleDateSelect = (date?: Date): void => {
    setFieldValue("date", date ? toDateFieldValue(date) : null, true);
  };

  return (
    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
      <InputField
        id="log-email-from-input"
        name="fromAddress"
        value={values.fromAddress}
        label={translateText(["logEmail", "modal", "labels", "from"])}
        placeholder={translateText([
          "logEmail",
          "modal",
          "placeholders",
          "from"
        ])}
        errorMessage={touched.fromAddress ? errors.fromAddress : ""}
        state={touched.fromAddress && errors.fromAddress ? "error" : "default"}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateAria(["from"])}
        fullWidth
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
                id="log-email-date-input"
                name="date"
                value={pickedDate ? pickedDate.toLocaleDateString() : ""}
                label={translateText(["logActivity", "labels", "date"])}
                placeholder={translateText([
                  "logActivity",
                  "placeholders",
                  "date"
                ])}
                errorMessage={touched.date ? errors.date : ""}
                state={touched.date && errors.date ? "error" : "default"}
                aria-label={translateAria(["date"])}
                rightIcon={<CalendarIcon />}
                fullWidth
                readOnly
                required
              />
            </div>
          </DatePicker>
        </div>
        <div className="flex-1">
          <Dropdown
            id="log-email-time-input"
            options={getActivityTimeOptions()}
            value={values.time}
            onChange={(value) => setFieldValue("time", value, true)}
            label={translateText(["logEmail", "modal", "labels", "time"])}
            placeholder={translateText(["logActivity", "placeholders", "time"])}
            variant={touched.time && errors.time ? "primary-error" : "primary"}
            errorMessage={touched.time ? errors.time : ""}
            className="rounded-lg"
            ariaLabel={translateAria(["time"])}
            width="100%"
            scrollToSelected
            required
          />
        </div>
      </div>

      <ActivityContactsField
        id="log-email-to"
        formik={formik}
        name="toContactIds"
        label={translateText(["logEmail", "modal", "labels", "to"])}
        placeholder={translateText([
          "logEmail",
          "modal",
          "placeholders",
          "recipients"
        ])}
        groupAriaLabel={translateAria(["to"])}
        hiddenContactIds={[...values.ccContactIds, ...values.bccContactIds]}
        required
      />

      <ActivityContactsField
        id="log-email-cc"
        formik={formik}
        name="ccContactIds"
        label={translateText(["logEmail", "modal", "labels", "cc"])}
        placeholder={translateText([
          "logEmail",
          "modal",
          "placeholders",
          "recipients"
        ])}
        groupAriaLabel={translateAria(["cc"])}
        hiddenContactIds={[...values.toContactIds, ...values.bccContactIds]}
      />

      <ActivityContactsField
        id="log-email-bcc"
        formik={formik}
        name="bccContactIds"
        label={translateText(["logEmail", "modal", "labels", "bcc"])}
        placeholder={translateText([
          "logEmail",
          "modal",
          "placeholders",
          "recipients"
        ])}
        groupAriaLabel={translateAria(["bcc"])}
        hiddenContactIds={[...values.toContactIds, ...values.ccContactIds]}
      />

      <InputField
        id="log-email-subject-input"
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

      <TextArea
        name="description"
        value={values.description}
        label={translateText(["logEmail", "modal", "labels", "description"])}
        placeholder={translateText([
          "logEmail",
          "modal",
          "placeholders",
          "description"
        ])}
        onChange={handleChange}
        rows={4}
        aria-label={translateAria(["description"])}
      />

      <ActivityAssociations
        isOpen={isAssociationsOpen}
        onToggle={() => setIsAssociationsOpen(!isAssociationsOpen)}
      >
        <ActivityDealField
          id="log-email-deal"
          formik={formik}
          fieldAriaLabel={translateAria(["deal"])}
        />
        <ActivityRelatedToField
          id="log-email-related-to"
          formik={formik}
          fieldAriaLabel={translateAria(["relatedTo"])}
        />
      </ActivityAssociations>
    </div>
  );
};

export default LogEmailModalForm;
