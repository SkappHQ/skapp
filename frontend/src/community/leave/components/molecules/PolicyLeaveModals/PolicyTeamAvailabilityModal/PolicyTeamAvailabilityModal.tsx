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
        <p className="flex w-[12.5rem] flex-row gap-5 text-secondary-text">
          {translateText(["date"])}
        </p>
        <p className="flex-1 text-secondary-text">
          {translateText(["awayMembers"])}
        </p>
      </div>
      <div className="flex max-h-[22.75rem] flex-col gap-4 overflow-auto pr-1">
        {teamAvailabilityData?.map((data) => (
          <div
            key={data.date}
            className="flex min-h-[3.75rem] flex-row items-center justify-start gap-5 rounded-lg bg-tertiary-background px-5 py-2"
          >
            <div className="flex w-[12.5rem] flex-row gap-5">
              <p>{removeLetters(data.date)}</p>
              <p className="text-primary-text">{data.dayOfWeek}</p>
            </div>
            <div className="flex flex-1 flex-row justify-start">
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
