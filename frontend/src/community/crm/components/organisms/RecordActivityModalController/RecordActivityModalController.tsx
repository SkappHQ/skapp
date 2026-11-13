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

const renderTypeField = (isDisabled: boolean): ReactNode => (
  <RecordActivityTypeField isDisabled={isDisabled} />
);

const RecordActivityModalController: FC = () => {
  const translateText = useTranslator("crmModule", "activities");

  const {
    recordActivityModalType,
    recordActivityPrefill,
    setRecordActivityModalType,
    setRecordActivityPrefill
  } = useCrmStore(
    useShallow((store) => ({
      recordActivityModalType: store.recordActivityModalType,
      recordActivityPrefill: store.recordActivityPrefill,
      setRecordActivityModalType: store.setRecordActivityModalType,
      setRecordActivityPrefill: store.setRecordActivityPrefill
    }))
  );

  const handleModalClose = (): void => {
    setRecordActivityModalType(null);
    setRecordActivityPrefill(null);
  };

  if (!recordActivityModalType) return null;

  const modalProps = {
    title: translateText(["addActivity", "modalTitle"]),
    typeField: renderTypeField,
    ...(recordActivityPrefill && { prefill: recordActivityPrefill }),
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
