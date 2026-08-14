import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { LeaveStates } from "~community/common/types/CommonTypes";
import { convertToYYYYMMDDFromDateTime } from "~community/common/utils/dateTimeUtils";
import { useCheckPolicyLeaveAvailability } from "~community/leave/api/PolicyLeaveApi";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { PolicyLeaveAvailabilityType } from "~community/leave/types/PolicyLeaveTypes";
import { getAvailabilityErrorMessage } from "~community/leave/utils/policyLeave/policyLeaveUtils";

const usePolicyLeaveAvailabilityCheck = (): string => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "applyPolicyLeaveModal"
  );

  const {
    selectedPolicyBalance,
    selectedDates,
    selectedDuration,
    setFormError
  } = usePolicyLeaveStore(
    useShallow((state) => ({
      selectedPolicyBalance: state.selectedPolicyBalance,
      selectedDates: state.selectedDates,
      selectedDuration: state.selectedDuration,
      setFormError: state.setFormError
    }))
  );

  const availabilityRequestIdRef = useRef<number>(0);

  const [availability, setAvailability] =
    useState<PolicyLeaveAvailabilityType | null>(null);

  const [hasAvailabilityCheckFailed, setHasAvailabilityCheckFailed] =
    useState<boolean>(false);

  const { mutate: checkAvailability } = useCheckPolicyLeaveAvailability();

  useEffect(() => {
    const requestId = ++availabilityRequestIdRef.current;

    setHasAvailabilityCheckFailed(false);

    if (
      !selectedPolicyBalance ||
      selectedDates.length === 0 ||
      selectedDuration === LeaveStates.NONE
    ) {
      setAvailability(null);
      return;
    }

    checkAvailability(
      {
        policyId: selectedPolicyBalance.policyId,
        startDate: convertToYYYYMMDDFromDateTime(selectedDates[0]),
        endDate: convertToYYYYMMDDFromDateTime(
          selectedDates[1] ?? selectedDates[0]
        ),
        leaveState: selectedDuration
      },
      {
        onSuccess: (data) => {
          if (requestId === availabilityRequestIdRef.current) {
            setAvailability(data);
          }
        },
        onError: () => {
          if (requestId === availabilityRequestIdRef.current) {
            setAvailability(null);
            setHasAvailabilityCheckFailed(true);
          }
        }
      }
    );
  }, [selectedDates, selectedDuration, selectedPolicyBalance?.policyId]);

  const availabilityError = useMemo(() => {
    if (hasAvailabilityCheckFailed) {
      return translateText(["errors", "availabilityCheckFailed"]);
    }

    if (!availability || availability.isValid || !selectedPolicyBalance) {
      return "";
    }

    return getAvailabilityErrorMessage({
      failureReason: availability.failureReason,
      remainingBalance: availability.remainingBalance,
      policyName: selectedPolicyBalance.policyName,
      translateText
    });
  }, [
    hasAvailabilityCheckFailed,
    availability,
    selectedPolicyBalance,
    translateText
  ]);

  useEffect(() => {
    setFormError("selectedDates", availabilityError);
  }, [availabilityError, setFormError]);

  return availabilityError;
};

export default usePolicyLeaveAvailabilityCheck;
