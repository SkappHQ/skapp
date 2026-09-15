import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useShallow } from "zustand/react/shallow";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { removeLetters } from "~community/common/regex/regexPatterns";
import { IconName } from "~community/common/types/IconTypes";
import PolicyTeamAvailabilityStatus from "~community/leave/components/molecules/PolicyTeamAvailabilityStatus/PolicyTeamAvailabilityStatus";
import { PolicyLeaveModalEnums } from "~community/leave/enums/PolicyLeaveEnums";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";

const PolicyTeamAvailabilityModal = () => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "teamAvailabilityModal"
  );

  const { teamAvailabilityData, setModalType } = usePolicyLeaveStore(
    useShallow((state) => ({
      teamAvailabilityData: state.teamAvailabilityData,
      setModalType: state.setModalType
    }))
  );

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
              <PolicyTeamAvailabilityStatus data={data} />
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
