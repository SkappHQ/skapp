import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityTypePickerModal from "~community/crm/activities/components/molecules/ActivityTypePickerModal/ActivityTypePickerModal";
import { ActivityType } from "~community/crm/activities/types/activityTypes";
import AddActivityTaskModalContent from "~community/crm/components/molecules/AddActivityTaskModalContent/AddActivityTaskModalContent";
import LogCallModalContent from "~community/crm/components/molecules/LogCallModalContent/LogCallModalContent";
import LogEmailModalContent from "~community/crm/components/molecules/LogEmailModalContent/LogEmailModalContent";
import LogMeetingModalContent from "~community/crm/components/molecules/LogMeetingModalContent/LogMeetingModalContent";
import { CrmActivityPrefill } from "~community/crm/types/CrmCommonTypes";

interface RecordActivityActionsProps {
  id: string;
  prefill: CrmActivityPrefill;
}

const RecordActivityActions: FC<RecordActivityActionsProps> = ({
  id,
  prefill
}) => {
  const translateText = useTranslator("crmModule", "activities", "addActivity");

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);

  const handleTypeSelect = (type: ActivityType): void => {
    setIsPickerOpen(false);
    setSelectedType(type);
  };

  const handleModalClose = (): void => setSelectedType(null);

  return (
    <>
      <ButtonV2
        id={`${id}-add`}
        variant="primary"
        type="button"
        onClick={() => setIsPickerOpen(true)}
      >
        {translateText(["button"])}
      </ButtonV2>
      {isPickerOpen && (
        <ActivityTypePickerModal
          id={`${id}-picker`}
          onSelect={handleTypeSelect}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
      {selectedType === ActivityType.TASK && (
        <AddActivityTaskModalContent
          prefill={prefill}
          onClose={handleModalClose}
        />
      )}
      {selectedType === ActivityType.CALL && (
        <LogCallModalContent prefill={prefill} onClose={handleModalClose} />
      )}
      {selectedType === ActivityType.MEETING && (
        <LogMeetingModalContent prefill={prefill} onClose={handleModalClose} />
      )}
      {selectedType === ActivityType.EMAIL && (
        <LogEmailModalContent prefill={prefill} onClose={handleModalClose} />
      )}
    </>
  );
};

export default RecordActivityActions;
