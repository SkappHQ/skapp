import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ACTIVITY_TYPE_ICON_MAP } from "~community/crm/activities/constants/activityConstants";
import { ActivityType } from "~community/crm/activities/types/activityTypes";

interface ActivityTypePickerModalProps {
  id: string;
  onSelect: (type: ActivityType) => void;
  onClose: () => void;
}

const ActivityTypePickerModal: FC<ActivityTypePickerModalProps> = ({
  id,
  onSelect,
  onClose
}) => {
  const translateText = useTranslator("crmModule", "activities");

  return (
    <SmallModal
      isOpen
      onClose={onClose}
      modalHeader={translateText(["addActivity", "pickerTitle"])}
      content={
        <div id={id} className="grid grid-cols-2 gap-3">
          {Object.values(ActivityType).map((type) => {
            const Icon = ACTIVITY_TYPE_ICON_MAP[type];

            return (
              <button
                key={type}
                id={`${id}-${type.toLowerCase()}`}
                type="button"
                className="flex items-center gap-3 p-4 rounded-lg border border-secondary-accent bg-white hover:bg-secondary-background body2 text-black cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-accent"
                onClick={() => onSelect(type)}
              >
                <Icon aria-hidden="true" />
                {translateText(["types", type.toLowerCase()])}
              </button>
            );
          })}
        </div>
      }
    />
  );
};

export default ActivityTypePickerModal;
