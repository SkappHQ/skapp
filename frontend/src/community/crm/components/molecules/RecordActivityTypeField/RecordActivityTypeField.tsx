import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityType } from "~community/crm/activities/types/activityTypes";
import { useCrmStore } from "~community/crm/store/store";

interface Props {
  isDisabled: boolean;
}

const RecordActivityTypeField: FC<Props> = ({ isDisabled }) => {
  const translateText = useTranslator("crmModule", "activities");
  const translateAria = useTranslator("crmAria", "activities");

  const { recordActivityModalType, setRecordActivityModalType } = useCrmStore(
    useShallow((store) => ({
      recordActivityModalType: store.recordActivityModalType,
      setRecordActivityModalType: store.setRecordActivityModalType
    }))
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
      value={recordActivityModalType ?? ""}
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
