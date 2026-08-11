import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarGroup from "~community/common/components/molecules/AvatarGroup/AvatarGroup";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { removeLetters } from "~community/common/regex/regexPatterns";
import { IconName } from "~community/common/types/IconTypes";
import { PolicyLeaveModalEnums } from "~community/leave/enums/PolicyLeaveEnums";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";

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
              {data?.holidays.length > 0 ? (
                <span className="inline-flex items-center rounded-full border border-border-surface-secondary text-secondary-text text-xs font-normal px-2 py-0.5">
                  {data.holidays.length > 1
                    ? `${data.holidays[0].name} +${data.holidays.length}`
                    : data.holidays[0].name}
                </span>
              ) : data.leaveCount === 0 ? (
                <span className="inline-flex items-center rounded-full bg-semantic-green-background text-semantic-green-text px-2 py-0.5">
                  {translateText(["fullTeamAvailable"])}
                </span>
              ) : data.availableCount === 0 ? (
                <span className="inline-flex items-center rounded-full bg-semantic-red-accent text-white px-2 py-0.5">
                  {translateText(["fullTeamAway"])}
                </span>
              ) : (
                <AvatarGroup avatars={data.employees} isHoverModal={true} />
              )}
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
