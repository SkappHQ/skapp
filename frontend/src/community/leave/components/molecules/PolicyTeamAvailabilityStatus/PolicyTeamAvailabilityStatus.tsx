import { FC } from "react";

import AvatarGroup from "~community/common/components/molecules/AvatarGroup/AvatarGroup";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { TeamAvailabilityDataType } from "~community/leave/types/MyRequests";

const CHIP_CLASSES = "inline-flex items-center rounded-full px-2 py-0.5";

interface Props {
  data: TeamAvailabilityDataType;
}

const PolicyTeamAvailabilityStatus: FC<Props> = ({ data }) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "teamAvailabilityModal"
  );

  if (data.holidays.length > 0) {
    return (
      <span
        className={`${CHIP_CLASSES} body3 border border-border-surface-secondary text-secondary-text`}
      >
        {data.holidays.length > 1
          ? `${data.holidays[0].name} +${data.holidays.length}`
          : data.holidays[0].name}
      </span>
    );
  }

  if (data.leaveCount === 0) {
    return (
      <span
        className={`${CHIP_CLASSES} bg-semantic-green-background text-semantic-green-text`}
      >
        {translateText(["fullTeamAvailable"])}
      </span>
    );
  }

  if (data.availableCount === 0) {
    return (
      <span className={`${CHIP_CLASSES} bg-semantic-red-accent text-white`}>
        {translateText(["fullTeamAway"])}
      </span>
    );
  }

  return <AvatarGroup avatars={data.employees} isHoverModal={true} />;
};

export default PolicyTeamAvailabilityStatus;
