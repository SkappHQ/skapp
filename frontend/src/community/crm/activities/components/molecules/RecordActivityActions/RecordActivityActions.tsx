import { ButtonV2, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityType } from "~community/crm/activities/types/activityTypes";
import { useCrmStore } from "~community/crm/store/store";
import { CrmActivityPrefill } from "~community/crm/types/CrmCommonTypes";
import ScheduleMeetingAction from "~enterprise/crm/components/organisms/ScheduleMeetingAction/ScheduleMeetingAction";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

interface RecordActivityActionsProps {
  id: string;
  prefill: CrmActivityPrefill;
  isLineButton?: boolean;
}

const RecordActivityActions: FC<RecordActivityActionsProps> = ({
  id,
  prefill,
  isLineButton = false
}) => {
  const translateText = useTranslator("crmModule", "activities");

  const { setRecordActivityModalType, setRecordActivityPrefill } = useCrmStore(
    useShallow((store) => ({
      setRecordActivityModalType: store.setRecordActivityModalType,
      setRecordActivityPrefill: store.setRecordActivityPrefill
    }))
  );

  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const handleAddActivity = (): void => {
    guardCrmCreate(CrmLimitResource.ACTIVITIES, () => {
      setRecordActivityPrefill(prefill);
      setRecordActivityModalType(ActivityType.TASK);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <ScheduleMeetingAction prefill={prefill} />
      <ButtonV2
        id={`${id}-add`}
        type="button"
        variant={isLineButton ? "line" : "primary"}
        {...(isLineButton && {
          size: "sm",
          icon: <PlusIcon />,
          iconPosition: "end"
        })}
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
