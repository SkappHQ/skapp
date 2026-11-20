import { FC, ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityType } from "~community/crm/activities/types/activityTypes";
import AddActivityTaskModalContent from "~community/crm/components/molecules/AddActivityTaskModalContent/AddActivityTaskModalContent";
import LogCallModalContent from "~community/crm/components/molecules/LogCallModalContent/LogCallModalContent";
import LogEmailModalContent from "~community/crm/components/molecules/LogEmailModalContent/LogEmailModalContent";
import LogMeetingModalContent from "~community/crm/components/molecules/LogMeetingModalContent/LogMeetingModalContent";
import RecordActivityTypeField from "~community/crm/components/molecules/RecordActivityTypeField/RecordActivityTypeField";
import { useCrmStore } from "~community/crm/store/store";

const RecordActivityModalController: FC = () => {
  const translateText = useTranslator("crmModule", "activities");

  const {
    isRecordActivityModalOpen,
    recordActivityModalType,
    recordActivityPrefill,
    recordActivityTriggerId,
    setIsRecordActivityModalOpen
  } = useCrmStore(
    useShallow((store) => ({
      isRecordActivityModalOpen: store.isRecordActivityModalOpen,
      recordActivityModalType: store.recordActivityModalType,
      recordActivityPrefill: store.recordActivityPrefill,
      recordActivityTriggerId: store.recordActivityTriggerId,
      setIsRecordActivityModalOpen: store.setIsRecordActivityModalOpen
    }))
  );

  const handleModalClose = (): void => {
    setIsRecordActivityModalOpen(false);
    requestAnimationFrame(() => {
      if (recordActivityTriggerId) {
        document.getElementById(recordActivityTriggerId)?.focus();
      }
    });
  };

  if (!isRecordActivityModalOpen) return null;

  const renderTypeField = (isDisabled: boolean): ReactNode => (
    <RecordActivityTypeField
      activityType={recordActivityModalType}
      isDisabled={isDisabled}
    />
  );

  const modalProps = {
    title: translateText(["addActivity", "modalTitle"]),
    typeField: renderTypeField,
    prefill: recordActivityPrefill,
    onClose: handleModalClose
  };

  switch (recordActivityModalType) {
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

export default RecordActivityModalController;
