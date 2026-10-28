import {
  ButtonV2,
  CalendarIcon,
  CloseIcon,
  DatePicker,
  InputField,
  SearchIcon,
  TextArea,
  Tooltip
} from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC, useState } from "react";

import { characterLengths } from "~community/common/constants/stringConstants";
import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  instantToPickedDay,
  pickedDayToInstant
} from "~community/common/utils/dateTimeUtils";
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

  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");
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

  const handleToggleAssociations = (): void => {
    if (isAssociationsOpen) {
      setFieldValue("deal", "");
      setFieldValue("company", "");
    }
    setIsAssociationsOpen((open) => !open);
  };

  return (
    <div className="flex flex-col w-full h-full justify-between gap-[0.625rem] max-h-[78vh]">
      <div className="flex flex-col gap-[0.625rem] overflow-y-auto pr-1">
        <InputField
          name="subject"
          value={values.subject}
          label={translateText([
            "activities",
            "logCall",
            "modal",
            "labels",
            "subject"
          ])}
          placeholder={translateText([
            "activities",
            "logCall",
            "modal",
            "placeholders",
            "subject"
          ])}
          errorMessage={touched.subject ? errors.subject : ""}
          state={touched.subject && errors.subject ? "error" : "default"}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-label={translateAria([
            "activities",
            "logCall",
            "modal",
            "subject"
          ])}
          maxLength={characterLengths.CALL_SUBJECT_LENGTH}
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
                  label={translateText([
                    "activities",
                    "logCall",
                    "modal",
                    "labels",
                    "date"
                  ])}
                  placeholder={translateText([
                    "activities",
                    "logCall",
                    "modal",
                    "placeholders",
                    "date"
                  ])}
                  aria-label={translateAria([
                    "activities",
                    "logCall",
                    "modal",
                    "date"
                  ])}
                  rightIcon={<CalendarIcon />}
                  fullWidth
                  readOnly
                />
              </div>
            </DatePicker>
          </div>
          <div className="flex-1">
            <InputField
              name="time"
              type="time"
              value={values.time}
              label={translateText([
                "activities",
                "logCall",
                "modal",
                "labels",
                "time"
              ])}
              placeholder={translateText([
                "activities",
                "logCall",
                "modal",
                "placeholders",
                "time"
              ])}
              onChange={handleChange}
              aria-label={translateAria([
                "activities",
                "logCall",
                "modal",
                "time"
              ])}
              fullWidth
            />
          </div>
        </div>

        <InputField
          name="duration"
          type="number"
          min={0}
          value={values.duration}
          label={translateText([
            "activities",
            "logCall",
            "modal",
            "labels",
            "duration"
          ])}
          placeholder={translateText([
            "activities",
            "logCall",
            "modal",
            "placeholders",
            "duration"
          ])}
          tooltipContent={translateText([
            "activities",
            "logCall",
            "modal",
            "tooltips",
            "duration"
          ])}
          tooltipPosition="left"
          ariaLabelTooltipButton={translateAria([
            "activities",
            "logCall",
            "modal",
            "durationInfo"
          ])}
          errorMessage={touched.duration ? errors.duration : ""}
          state={touched.duration && errors.duration ? "error" : "default"}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-label={translateAria([
            "activities",
            "logCall",
            "modal",
            "duration"
          ])}
          fullWidth
        />

        <div className="flex flex-row items-start gap-[0.625rem]">
          <div className="flex-1">
            <Tooltip content={values.contact} disabled={!values.contact}>
              <InputField
                name="contact"
                value={values.contact}
                label={translateText([
                  "activities",
                  "logCall",
                  "modal",
                  "labels",
                  "contact"
                ])}
                placeholder={translateText([
                  "activities",
                  "logCall",
                  "modal",
                  "placeholders",
                  "contact"
                ])}
                errorMessage={touched.contact ? errors.contact : ""}
                state={touched.contact && errors.contact ? "error" : "default"}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-label={translateAria([
                  "activities",
                  "logCall",
                  "modal",
                  "contact"
                ])}
                rightIcon={<SearchIcon />}
                fullWidth
                required
              />
            </Tooltip>
          </div>
          <div className="flex-1">
            <LogCallOwnerField formik={formik} />
          </div>
        </div>

        <TextArea
          name="comments"
          value={values.comments}
          label={translateText([
            "activities",
            "logCall",
            "modal",
            "labels",
            "comments"
          ])}
          placeholder={translateText([
            "activities",
            "logCall",
            "modal",
            "placeholders",
            "comments"
          ])}
          errorMessage={touched.comments ? errors.comments : ""}
          state={touched.comments && errors.comments ? "error" : "default"}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={4}
          maxLength={characterLengths.CALL_COMMENTS_LENGTH}
          aria-label={translateAria([
            "activities",
            "logCall",
            "modal",
            "comments"
          ])}
        />

        {isAssociationsOpen && (
          <>
            <Tooltip content={values.deal} disabled={!values.deal}>
              <InputField
                name="deal"
                value={values.deal}
                label={translateText([
                  "activities",
                  "logCall",
                  "modal",
                  "labels",
                  "deal"
                ])}
                placeholder={translateText([
                  "activities",
                  "logCall",
                  "modal",
                  "placeholders",
                  "deal"
                ])}
                onChange={handleChange}
                aria-label={translateAria([
                  "activities",
                  "logCall",
                  "modal",
                  "deal"
                ])}
                rightIcon={<SearchIcon />}
                fullWidth
              />
            </Tooltip>
            <Tooltip content={values.company} disabled={!values.company}>
              <InputField
                name="company"
                value={values.company}
                label={translateText([
                  "activities",
                  "logCall",
                  "modal",
                  "labels",
                  "relatedTo"
                ])}
                placeholder={translateText([
                  "activities",
                  "logCall",
                  "modal",
                  "placeholders",
                  "relatedTo"
                ])}
                onChange={handleChange}
                aria-label={translateAria([
                  "activities",
                  "logCall",
                  "modal",
                  "relatedTo"
                ])}
                rightIcon={<SearchIcon />}
                fullWidth
              />
            </Tooltip>
          </>
        )}

        <button
          type="button"
          className="self-start text-sm text-primary underline"
          aria-expanded={isAssociationsOpen}
          onClick={handleToggleAssociations}
        >
          {isAssociationsOpen
            ? translateText([
                "activities",
                "logCall",
                "modal",
                "buttons",
                "hideAssociations"
              ])
            : translateText([
                "activities",
                "logCall",
                "modal",
                "buttons",
                "addAssociations"
              ])}
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
          aria-label={translateAria([
            "activities",
            "logCall",
            "modal",
            "cancel"
          ])}
        >
          {translateText([
            "activities",
            "logCall",
            "modal",
            "buttons",
            "cancel"
          ])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={submitForm}
          disabled={isSubmitting || !dirty}
          aria-label={translateAria(["activities", "logCall", "modal", "save"])}
        >
          {translateText(["activities", "logCall", "modal", "buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default LogCallModalForm;
