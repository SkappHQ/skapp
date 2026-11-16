import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityType } from "~community/crm/activities/types/activityTypes";
import { useCrmStore } from "~community/crm/store/store";

interface Props {
  activityType: ActivityType;
  isDisabled: boolean;
}

const RecordActivityTypeField: FC<Props> = ({ activityType, isDisabled }) => {
  const translateText = useTranslator("crmModule", "activities");
  const translateAria = useTranslator("crmAria", "activities");

  const setRecordActivityModalType = useCrmStore(
    (store) => store.setRecordActivityModalType
  );

  const typeOptions = Object.values(ActivityType).map((option) => ({
    id: option,
    value: option,
    label: translateText(["types", option.toLowerCase()])
  }));

  const handleTypeChange = (value: string): void => {
    const selectedOption = typeOptions.find((option) => option.value === value);

    if (selectedOption) setRecordActivityModalType(selectedOption.value);
  };

  return (
    <Dropdown
      id="record-activity-type"
      options={typeOptions}
      value={activityType}
      onChange={handleTypeChange}
      label={translateText(["addActivity", "typeLabel"])}
      variant={isDisabled ? "primary-disabled" : "primary"}
      ariaLabel={translateAria(["addActivity", "type"])}
      className="rounded-lg"
      width="100%"
    />
  );
};

export default RecordActivityTypeField;
