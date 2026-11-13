import { ButtonV2, Dropdown } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityType } from "~community/crm/activities/types/activityTypes";
import AddActivityTaskModalContent from "~community/crm/components/molecules/AddActivityTaskModalContent/AddActivityTaskModalContent";
import LogCallModalContent from "~community/crm/components/molecules/LogCallModalContent/LogCallModalContent";
import LogEmailModalContent from "~community/crm/components/molecules/LogEmailModalContent/LogEmailModalContent";
import LogMeetingModalContent from "~community/crm/components/molecules/LogMeetingModalContent/LogMeetingModalContent";

interface RecordActivityActionsProps {
  id: string;
}

const RecordActivityActions: FC<RecordActivityActionsProps> = ({ id }) => {
  const translateText = useTranslator("crmModule", "activities");

  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);

  const handleModalClose = (): void => setSelectedType(null);

  const renderModal = (type: ActivityType) => {
    const modalProps = {
      title: translateText(["addActivity", "modalTitle"]),
      typeField: (
        <Dropdown
          id={`${id}-type`}
          options={Object.values(ActivityType).map((option) => ({
            id: option,
            value: option,
            label: translateText(["types", option.toLowerCase()])
          }))}
          value={type}
          onChange={(value) => setSelectedType(value as ActivityType)}
          label={translateText(["addActivity", "typeLabel"])}
          variant="primary"
          className="rounded-lg"
          width="100%"
        />
      ),
      onClose: handleModalClose
    };

    switch (type) {
      case ActivityType.TASK:
        return <AddActivityTaskModalContent {...modalProps} />;
      case ActivityType.CALL:
        return <LogCallModalContent {...modalProps} />;
      case ActivityType.MEETING:
        return <LogMeetingModalContent {...modalProps} />;
      case ActivityType.EMAIL:
        return <LogEmailModalContent {...modalProps} />;
    }
  };

  return (
    <>
      <ButtonV2
        id={`${id}-add`}
        variant="primary"
        type="button"
        onClick={() => setSelectedType(ActivityType.TASK)}
      >
        {translateText(["addActivity", "button"])}
      </ButtonV2>
      {selectedType && renderModal(selectedType)}
    </>
  );
};

export default RecordActivityActions;
