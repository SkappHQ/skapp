import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { LeaveStates } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { PolicyLeaveModalEnums } from "~community/leave/enums/PolicyLeaveEnums";
import useApplyPolicyLeaveSubmit from "~community/leave/hooks/useApplyPolicyLeaveSubmit";
import usePolicyLeaveAvailabilityCheck from "~community/leave/hooks/usePolicyLeaveAvailabilityCheck";
import usePolicyLeaveCalendarData from "~community/leave/hooks/usePolicyLeaveCalendarData";
import usePolicyLeaveTeamAvailability from "~community/leave/hooks/usePolicyLeaveTeamAvailability";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { useLeaveStore } from "~community/leave/store/store";
import { selectHasUnsavedChanges } from "~community/leave/utils/policyLeave/policyLeaveUtils";

import PolicyLeaveDateSection from "./PolicyLeaveDateSection";
import PolicyLeaveRequestDetailsSection from "./PolicyLeaveRequestDetailsSection";

const ApplyPolicyLeaveModal: FC = () => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "applyPolicyLeaveModal"
  );
  const translateAria = useTranslator("leaveAria", "applyLeave");

  const {
    selectedPolicyBalance,
    selectedDates,
    selectedDuration,
    setModalType
  } = usePolicyLeaveStore((state) => ({
    selectedPolicyBalance: state.selectedPolicyBalance,
    selectedDates: state.selectedDates,
    selectedDuration: state.selectedDuration,
    setModalType: state.setModalType
  }));

  const hasUnsavedChanges = usePolicyLeaveStore(selectHasUnsavedChanges);

  const isCalendarSelectionInvalid = useLeaveStore(
    (state) => state.isApplyLeaveModalBtnDisabled
  );

  const {
    allHolidays,
    workingDays,
    blockingLeaveRequests,
    minDate,
    maxDate,
    disabledDurationOptions
  } = usePolicyLeaveCalendarData();

  const { myTeams, resourceAvailability } = usePolicyLeaveTeamAvailability();

  const availabilityError = usePolicyLeaveAvailabilityCheck();

  const { submitPolicyLeave, isApplyPending } = useApplyPolicyLeaveSubmit({
    availabilityError
  });

  if (!selectedPolicyBalance) {
    return null;
  }

  const isSubmitDisabled =
    selectedDates.length === 0 ||
    selectedDuration === LeaveStates.NONE ||
    isCalendarSelectionInvalid ||
    !!availabilityError;

  const handleCancel = (): void => {
    setModalType(
      hasUnsavedChanges
        ? PolicyLeaveModalEnums.DISCARD_CHANGES
        : PolicyLeaveModalEnums.NONE
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-3 md:gap-7">
        <PolicyLeaveDateSection
          policyBalance={selectedPolicyBalance}
          allHolidays={allHolidays}
          workingDays={workingDays}
          blockingLeaveRequests={blockingLeaveRequests}
          minDate={minDate}
          maxDate={maxDate}
        />
        <PolicyLeaveRequestDetailsSection
          policyBalance={selectedPolicyBalance}
          myTeams={myTeams}
          resourceAvailability={resourceAvailability}
          workingDays={workingDays}
          disabledDurationOptions={disabledDurationOptions}
          isSummaryVisible={!isSubmitDisabled}
        />
      </div>
      <div className="flex flex-row gap-3 mt-4 justify-end">
        <ButtonV2
          variant={"tertiary"}
          onClick={handleCancel}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["cancelBtn"])}
        </ButtonV2>
        <ButtonV2
          variant={"primary"}
          onClick={submitPolicyLeave}
          isLoading={isApplyPending}
          disabled={isSubmitDisabled || isApplyPending}
          aria-label={translateAria(["confirmApplyLeave"])}
          icon={<Icon name={IconName.TICK_ICON} />}
          iconPosition="end"
        >
          {translateText(["submitBtn"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default ApplyPolicyLeaveModal;
