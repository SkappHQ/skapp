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
import { FC, useState } from "react";

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

const FIELD_IDS = {
  SUBJECT: "log-call-subject",
  DURATION: "log-call-duration",
  CONTACT: "log-call-contact",
  OWNER: "log-call-owner",
  DEAL: "log-call-deal",
  RELATED_TO: "log-call-related-to"
};

const FIELD_FOCUS_ORDER: {
  field: keyof CrmLogCallFormValues;
  elementId: string;
}[] = [
  { field: "subject", elementId: FIELD_IDS.SUBJECT },
  { field: "duration", elementId: FIELD_IDS.DURATION },
  { field: "contactId", elementId: `${FIELD_IDS.CONTACT}-input` },
  { field: "ownerId", elementId: `${FIELD_IDS.OWNER}-input` }
];

interface Props {
  formik: FormikProps<CrmLogCallFormValues>;
  isPending: boolean;
  onCancel: () => void;
}

const LogCallModalForm: FC<Props> = ({ formik, isPending, onCancel }) => {
  const {
    values,
    errors,
    status,
    touched,
    handleChange,
    handleBlur,
    dirty,
    isSubmitting,
    setFieldValue,
    submitForm,
    validateForm
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

  const isDealMismatch =
    Boolean(status) &&
    status.mismatchedDealId === values.dealId &&
    status.mismatchedContactId === values.contactId;

  const isAssociationsVisible = isAssociationsOpen || isDealMismatch;

  const handleDealCleared = (): void => {
    setIsDealClearedNoticeVisible(true);
    setIsAssociationsOpen(true);
  };

  const handleSave = async (): Promise<void> => {
    await submitForm();
    const formErrors = await validateForm();
    const firstInvalidField = FIELD_FOCUS_ORDER.find(
      ({ field }) => formErrors[field]
    );

    if (firstInvalidField) {
      document.getElementById(firstInvalidField.elementId)?.focus();
    }
  };

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
    <div className="flex flex-col w-full h-full justify-between gap-[0.625rem] max-h-[78vh]">
      <div className="flex flex-col gap-[0.625rem] overflow-y-auto pr-1">
        <InputField
          id={FIELD_IDS.SUBJECT}
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
          id={FIELD_IDS.DURATION}
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
              id={FIELD_IDS.CONTACT}
              formik={formik}
              onDealCleared={handleDealCleared}
            />
          </div>
          <div className="flex-1">
            <LogCallOwnerField id={FIELD_IDS.OWNER} formik={formik} />
          </div>
        </div>

        <TextArea
          name="comments"
          value={values.comments}
          label={translateText(["labels", "comments"])}
          placeholder={translateText(["placeholders", "comments"])}
          onChange={handleChange}
          rows={4}
          aria-label={translateAria(["comments"])}
        />

        {isAssociationsVisible && (
          <>
            <LogCallDealField
              id={FIELD_IDS.DEAL}
              formik={formik}
              errorMessage={
                isDealMismatch
                  ? translateText(["validations", "dealMismatch"])
                  : ""
              }
              isClearedNoticeVisible={isDealClearedNoticeVisible}
              onDealChange={() => setIsDealClearedNoticeVisible(false)}
            />
            <LogCallCompanyField id={FIELD_IDS.RELATED_TO} formik={formik} />
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

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isPending || isSubmitting}
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
          onClick={handleSave}
          disabled={isPending || isSubmitting || !dirty}
          isLoading={isPending}
          aria-label={translateAria(["save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default LogCallModalForm;
