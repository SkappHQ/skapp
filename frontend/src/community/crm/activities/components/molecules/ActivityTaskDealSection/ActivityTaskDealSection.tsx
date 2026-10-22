import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityLink } from "~community/crm/activities/types/activityTypes";
import { getLinkLabel } from "~community/crm/activities/utils/activityFeedUtil";

interface ActivityTaskDealSectionProps {
  id: string;
  deal: ActivityLink | null;
}

const ActivityTaskDealSection: FC<ActivityTaskDealSectionProps> = ({
  id,
  deal
}) => {
  const translateText = useTranslator("crmModule");

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="flex flex-col gap-3"
    >
      <h2 id={`${id}-heading`} className="h2">
        {translateText(["activities", "taskPanel", "dealsTitle"])}
      </h2>
      <hr className="border-secondary-accent" />
      {deal ? (
        <div className="border border-secondary-accent rounded-lg p-3">
          <span
            id={`${id}-deal-${deal.id}`}
            className={`body2 truncate ${
              deal.deleted ? "text-secondary-icon" : "text-black"
            }`}
            title={getLinkLabel(deal, translateText)}
          >
            {getLinkLabel(deal, translateText)}
          </span>
        </div>
      ) : (
        <p className="body2 text-secondary-text">
          {translateText(["activities", "taskPanel", "noDealsDescription"])}
        </p>
      )}
    </section>
  );
};

export default ActivityTaskDealSection;
