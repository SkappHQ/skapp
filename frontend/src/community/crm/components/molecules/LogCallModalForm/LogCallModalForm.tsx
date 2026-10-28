import {
  ButtonV2,
  CalendarIcon,
  CloseIcon,
  DatePicker,
  Dropdown,
  InputField,
  SearchIcon,
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

import LogCallOwnerField from "./LogCallOwnerField";

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
          name="duration"
          value={values.duration}
          label={translateText(["labels", "duration"])}
          placeholder={translateText(["placeholders", "duration"])}
          onChange={handleChange}
          aria-label={translateAria(["duration"])}
          fullWidth
        />

        <div className="flex flex-row items-start gap-[0.625rem]">
          <div className="flex-1">
            <InputField
              name="contact"
              title={values.contact}
              value={values.contact}
              label={translateText(["labels", "contact"])}
              placeholder={translateText(["placeholders", "contact"])}
              errorMessage={touched.contact ? errors.contact : ""}
              state={touched.contact && errors.contact ? "error" : "default"}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-label={translateAria(["contact"])}
              rightIcon={<SearchIcon />}
              fullWidth
              required
            />
          </div>
          <div className="flex-1">
            <LogCallOwnerField formik={formik} />
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

        {isAssociationsOpen && (
          <>
            <InputField
              name="deal"
              title={values.deal}
              value={values.deal}
              label={translateText(["labels", "deal"])}
              placeholder={translateText(["placeholders", "deal"])}
              onChange={handleChange}
              aria-label={translateAria(["deal"])}
              rightIcon={<SearchIcon />}
              fullWidth
            />
            <InputField
              name="company"
              title={values.company}
              value={values.company}
              label={translateText(["labels", "relatedTo"])}
              placeholder={translateText(["placeholders", "relatedTo"])}
              onChange={handleChange}
              aria-label={translateAria(["relatedTo"])}
              rightIcon={<SearchIcon />}
              fullWidth
            />
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

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
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
