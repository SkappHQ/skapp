import {
  CalendarIcon,
  DatePicker,
  Dropdown,
  InputField,
  TextArea
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
import ActivityAssociations from "~community/crm/components/molecules/ActivityAssociations/ActivityAssociations";
import ActivityContactField from "~community/crm/components/molecules/ActivityContactField/ActivityContactField";
import ActivityDealField from "~community/crm/components/molecules/ActivityDealField/ActivityDealField";
import ActivityOwnerField from "~community/crm/components/molecules/ActivityOwnerField/ActivityOwnerField";
import ActivityRelatedToField from "~community/crm/components/molecules/ActivityRelatedToField/ActivityRelatedToField";
import { useGetPriorityOptions } from "~community/crm/hooks/useGetPriorityOptions";
import { useCrmStore } from "~community/crm/store/store";
import { CrmAddTaskFormValues } from "~community/crm/types/CrmCommonTypes";
import { isDealMatchingCompany } from "~community/crm/utils/dealUtil";

interface Props {
  formik: FormikProps<CrmAddTaskFormValues>;
}

const AddActivityTaskModalForm: FC<Props> = ({ formik }) => {
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
    "addTask",
    "modal"
  );
  const displayZone = useDisplayZone();
  const priorityOptions = useGetPriorityOptions();

  const contacts = useCrmStore((state) => state.contacts);
  const deals = useCrmStore((state) => state.deals);

  const [isAssociationsOpen, setIsAssociationsOpen] = useState(false);
  const [isDealClearedNoticeVisible, setIsDealClearedNoticeVisible] =
    useState(false);

  const handleDealCleared = (): void => {
    setIsDealClearedNoticeVisible(true);
    setIsAssociationsOpen(true);
  };

  const contactCompanyId = values.contactId
    ? contacts[values.contactId]?.companyId
    : null;

  const selectedDeal = values.dealId ? deals[values.dealId] : null;

  const isDealMismatch =
    Boolean(
      selectedDeal &&
      values.contactId &&
      !isDealMatchingCompany(selectedDeal, contactCompanyId)
    ) ||
    (Boolean(status) &&
      status.mismatchedDealId === values.dealId &&
      status.mismatchedContactId === values.contactId);

  const isAssociationsVisible = isAssociationsOpen || isDealMismatch;

  const dueDate = values.dueAt
    ? instantToPickedDay(values.dueAt, displayZone)
    : null;

  const handleDueDateSelect = (date?: Date): void => {
    setFieldValue(
      "dueAt",
      date ? pickedDayToInstant(date, displayZone) : null,
      true
    );
  };

  return (
    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
      <InputField
        id="add-task-name-input"
        name="name"
        value={values.name}
        label={translateText(["addTask", "modal", "labels", "taskName"])}
        placeholder={translateText([
          "addTask",
          "modal",
          "placeholders",
          "taskName"
        ])}
        errorMessage={touched.name ? errors.name : ""}
        state={touched.name && errors.name ? "error" : "default"}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateAria(["taskName"])}
        maxLength={characterLengths.TASK_NAME_LENGTH}
        fullWidth
        required
      />

      <Dropdown
        id="add-task-priority-input"
        options={priorityOptions}
        value={values.priority ?? ""}
        onChange={(value) => setFieldValue("priority", value, true)}
        label={translateText(["addTask", "modal", "labels", "priority"])}
        variant={
          touched.priority && errors.priority ? "primary-error" : "primary"
        }
        errorMessage={touched.priority ? errors.priority : ""}
        className="rounded-lg"
        ariaLabel={translateAria(["priority"])}
        width="100%"
      />

      <div className="flex flex-row items-start gap-[0.625rem]">
        <div className="flex-1">
          <DatePicker
            mode="single"
            {...(dueDate && { selected: dueDate })}
            onSelect={handleDueDateSelect}
            popperProps={{ position: "bottom-start", isFlip: true }}
          >
            <div>
              <InputField
                id="add-task-dueAt-input"
                name="dueAt"
                value={dueDate ? dueDate.toLocaleDateString() : ""}
                label={translateText(["addTask", "modal", "labels", "dueDate"])}
                placeholder={translateText([
                  "addTask",
                  "modal",
                  "placeholders",
                  "dueDate"
                ])}
                errorMessage={touched.dueAt ? errors.dueAt : ""}
                state={touched.dueAt && errors.dueAt ? "error" : "default"}
                aria-label={translateAria(["dueDate"])}
                rightIcon={<CalendarIcon />}
                fullWidth
                readOnly
                required
              />
            </div>
          </DatePicker>
        </div>
        <div className="flex-1">
          <ActivityOwnerField id="add-task-ownerId" formik={formik} />
        </div>
      </div>

      <ActivityContactField
        id="add-task-contactId"
        formik={formik}
        label={translateText(["addTask", "modal", "labels", "contact"])}
        fieldAriaLabel={translateAria(["contact"])}
        onDealCleared={handleDealCleared}
      />

      <TextArea
        name="notes"
        value={values.notes}
        label={translateText(["addTask", "modal", "labels", "notes"])}
        placeholder={translateText([
          "addTask",
          "modal",
          "placeholders",
          "notes"
        ])}
        errorMessage={touched.notes ? errors.notes : ""}
        state={touched.notes && errors.notes ? "error" : "default"}
        onChange={handleChange}
        onBlur={handleBlur}
        rows={2}
        maxLength={characterLengths.TASK_NOTES_LENGTH}
        aria-label={translateAria(["notes"])}
      />

      <ActivityAssociations
        isOpen={isAssociationsVisible}
        onToggle={() => setIsAssociationsOpen(!isAssociationsVisible)}
      >
        <ActivityDealField
          id="add-task-deal"
          formik={formik}
          fieldAriaLabel={translateAria(["deal"])}
          clearedNoticeText={translateText([
            "addTask",
            "modal",
            "notices",
            "dealCleared"
          ])}
          isClearedNoticeVisible={isDealClearedNoticeVisible}
          onDealChange={() => setIsDealClearedNoticeVisible(false)}
          {...(contactCompanyId && { filterCompanyId: contactCompanyId })}
          {...(isDealMismatch && {
            errorMessage: translateText([
              "logActivity",
              "validations",
              "dealMismatch"
            ])
          })}
        />
        <ActivityRelatedToField
          id="add-task-related-to"
          formik={formik}
          fieldAriaLabel={translateAria(["relatedTo"])}
        />
      </ActivityAssociations>
    </div>
  );
};

export default AddActivityTaskModalForm;
