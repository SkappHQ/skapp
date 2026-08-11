import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarGroup from "~community/common/components/molecules/AvatarGroup/AvatarGroup";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { removeLetters } from "~community/common/regex/regexPatterns";
import { IconName } from "~community/common/types/IconTypes";
import { PolicyLeaveModalEnums } from "~community/leave/enums/PolicyLeaveEnums";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { TeamAvailabilityDataType } from "~community/leave/types/MyRequests";

const CHIP_CLASSES = "inline-flex items-center rounded-full px-2 py-0.5";

interface TeamAvailabilityStatusProps {
  data: TeamAvailabilityDataType;
}

const TeamAvailabilityStatus = ({ data }: TeamAvailabilityStatusProps) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "teamAvailabilityModal"
  );

  if (data.holidays.length > 0) {
    return (
      <span
        className={`${CHIP_CLASSES} border border-border-surface-secondary text-secondary-text text-xs font-normal`}
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

const PolicyTeamAvailabilityModal = () => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "teamAvailabilityModal"
  );

  const teamAvailabilityData = usePolicyLeaveStore(
    (state) => state.teamAvailabilityData
  );
  const setModalType = usePolicyLeaveStore((state) => state.setModalType);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-5">
        <p className="text-secondary-text w-[12.5rem] flex flex-row gap-5">
          {translateText(["date"])}
        </p>
        <p className="text-secondary-text flex-1">
          {translateText(["awayMembers"])}
        </p>
      </div>
      <div className="flex flex-col gap-4 max-h-[22.75rem] pr-1 overflow-auto">
        {teamAvailabilityData?.map((data) => (
          <div
            key={data.date}
            className="flex flex-row justify-start items-center min-h-[3.75rem] gap-5 px-5 py-2 bg-tertiary-background rounded-lg"
          >
            <div className="flex flex-row w-[12.5rem] gap-5">
              <p>{removeLetters(data.date)}</p>
              <p className="text-primary-text">{data.dayOfWeek}</p>
            </div>
            <div className="flex flex-row justify-start flex-1">
              <TeamAvailabilityStatus data={data} />
            </div>
          </div>
        ))}
      </div>
      <ButtonV2
        variant={"tertiary"}
        onClick={() => setModalType(PolicyLeaveModalEnums.APPLY_POLICY_LEAVE)}
        icon={<Icon name={IconName.LEFT_ARROW_ICON} />}
        iconPosition="start"
      >
        {translateText(["goBackBtn"])}
      </ButtonV2>
    </div>
  );
};

export default PolicyTeamAvailabilityModal;
