import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityType } from "~community/crm/activities/types/activityTypes";
import { useCrmStore } from "~community/crm/store/store";
import { CrmActivityPrefill } from "~community/crm/types/CrmCommonTypes";
import ScheduleMeetingModalController from "~enterprise/crm/components/organisms/ScheduleMeetingModalController/ScheduleMeetingModalController";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

interface RecordActivityActionsProps {
  id: string;
  prefill: CrmActivityPrefill;
}

const RecordActivityActions: FC<RecordActivityActionsProps> = ({
  id,
  prefill
}) => {
  const translateText = useTranslator("crmModule", "activities");

  const {
    setIsRecordActivityModalOpen,
    setRecordActivityModalType,
    setRecordActivityPrefill
  } = useCrmStore(
    useShallow((store) => ({
      setIsRecordActivityModalOpen: store.setIsRecordActivityModalOpen,
      setRecordActivityModalType: store.setRecordActivityModalType,
      setRecordActivityPrefill: store.setRecordActivityPrefill
    }))
  );

  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const handleAddActivity = (): void => {
    guardCrmCreate(CrmLimitResource.ACTIVITIES, () => {
      setRecordActivityPrefill(prefill);
      setRecordActivityModalType(ActivityType.TASK);
      setIsRecordActivityModalOpen(true);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <ScheduleMeetingModalController prefill={prefill} />
      <ButtonV2
        id={`${id}-add`}
        type="button"
        variant="primary"
        disabled={isCheckingCrmLimit}
        isLoading={isCheckingCrmLimit}
        onClick={handleAddActivity}
      >
        {translateText(["addActivity", "button"])}
      </ButtonV2>
    </div>
  );
};

export default RecordActivityActions;
