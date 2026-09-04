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
import { FC, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { characterLengths } from "~community/common/constants/stringConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { convertUTCStringToLocalDateTime } from "~community/common/utils/dateTimeUtils";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { useGetPriorityOptions } from "~community/crm/v2/hooks/useGetPriorityOptions";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getTaskTypeOptions } from "~community/crm/v2/utils/taskUtil";

import TaskContactField from "./TaskContactField";
import TaskDealField from "./TaskDealField";
import TaskOwnerField from "./TaskOwnerField";

interface Props {
  formik: FormikProps<CrmTaskEntity>;
  isPending: boolean;
  onCancel: () => void;
}

const TaskModalForm: FC<Props> = ({ formik, isPending, onCancel }) => {
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    dirty,
    isSubmitting,
    setFieldValue,
    submitForm
  } = formik;

  const translateText = useTranslator("crmModule", "tasks", "taskModal");

  const { taskTypes } = useCrmStoreV2(
    useShallow((store) => ({
      taskTypes: store.taskTypes
    }))
  );

  const taskTypeOptions = useMemo(
    () =>
      getTaskTypeOptions(taskTypes).map((option) => ({
        ...option,
        label: translateText(["taskTypes", option.label])
      })),
    [taskTypes, translateText]
  );

  const priorityOptions = useGetPriorityOptions();

  const handleTypeChange = (value: string) => {
    setFieldValue("typeId", Number(value));
  };

  const handlePriorityChange = (value: string) => {
    setFieldValue("priority", value as CrmPriorityEnum);
  };

  const handleDueDateSelect = (date: Date | undefined) => {
    setFieldValue("dueAt", date?.toISOString() ?? null);
  };

  const dueDate = values.dueAt
    ? convertUTCStringToLocalDateTime(values.dueAt).toJSDate()
    : undefined;

  return (
    <div className="flex flex-col w-full h-full justify-between gap-[0.625rem] max-h-[78vh]">
      <div className="flex flex-col gap-[0.625rem] overflow-y-auto pr-1">
        <InputField
          name="name"
          value={values.name ?? ""}
          errorMessage={errors.name}
          state={errors.name ? "error" : "default"}
          label={translateText(["labels", "task"])}
          placeholder={translateText(["placeholders", "task"])}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-label={translateText(["ariaLabels", "task"])}
          maxLength={characterLengths.TASK_NAME_LENGTH}
          fullWidth
          required
        />

        <div className="flex flex-row items-start gap-[0.625rem]">
          <div className="flex-1">
            <Dropdown
              options={taskTypeOptions}
              value={values.typeId?.toString()}
              onChange={handleTypeChange}
              label={translateText(["labels", "type"])}
              placeholder={translateText(["placeholders", "type"])}
              errorMessage={errors.typeId}
              variant={errors.typeId ? "primary-error" : "primary"}
              className="rounded-lg"
              ariaLabel={translateText(["ariaLabels", "type"])}
              width="100%"
              required
            />
          </div>
          <div className="flex-1">
            <Dropdown
              options={priorityOptions}
              value={values.priority}
              onChange={handlePriorityChange}
              label={translateText(["labels", "priority"])}
              placeholder={translateText(["placeholders", "priority"])}
              className="rounded-lg"
              variant="primary"
              ariaLabel={translateText(["ariaLabels", "priority"])}
              width="100%"
            />
          </div>
        </div>

        <div className="flex flex-row items-start gap-[0.625rem]">
          <div className="flex-1">
            <DatePicker
              mode="single"
              selected={dueDate}
              onSelect={handleDueDateSelect}
              popperProps={{ position: "bottom-start", isFlip: true }}
            >
              <div>
                <InputField
                  name="dueAt"
                  value={dueDate ? dueDate.toLocaleDateString() : ""}
                  label={translateText(["labels", "dueDate"])}
                  placeholder={translateText(["placeholders", "dueDate"])}
                  errorMessage={errors.dueAt}
                  state={errors.dueAt ? "error" : "default"}
                  aria-label={translateText(["ariaLabels", "dueDate"])}
                  rightIcon={<CalendarIcon />}
                  fullWidth
                  readOnly
                  required
                />
              </div>
            </DatePicker>
          </div>

          <div className="flex-1">
            <TaskOwnerField formik={formik} />
          </div>
        </div>

        <TaskContactField formik={formik} />

        <TaskDealField formik={formik} />

        <TextArea
          name="notes"
          value={values.notes ?? ""}
          label={translateText(["labels", "notes"])}
          placeholder={translateText(["placeholders", "notes"])}
          errorMessage={errors.notes}
          state={errors.notes ? "error" : "default"}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={3}
          maxLength={characterLengths.TASK_NOTES_LENGTH}
          aria-label={translateText(["ariaLabels", "notes"])}
        />
      </div>

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isPending || isSubmitting}
          onClick={onCancel}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateText(["ariaLabels", "cancel"])}
        >
          {translateText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={submitForm}
          disabled={isPending || isSubmitting || !dirty}
          isLoading={isPending}
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default TaskModalForm;
