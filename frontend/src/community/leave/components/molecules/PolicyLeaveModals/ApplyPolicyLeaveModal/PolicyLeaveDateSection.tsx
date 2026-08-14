import { FC, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import CalendarDateRangePicker from "~community/common/components/molecules/CalendarDateRangePicker/CalendarDateRangePicker";
import { daysTypes } from "~community/common/constants/stringConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import PolicyLeaveBalanceCard from "~community/leave/components/molecules/PolicyLeaveBalanceCard/PolicyLeaveBalanceCard";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { MyLeaveRequestPayloadType } from "~community/leave/types/MyRequests";
import { EmployeePolicyBalanceType } from "~community/leave/types/PolicyLeaveTypes";
import { Holiday } from "~community/people/types/HolidayTypes";

interface Props {
  policyBalance: EmployeePolicyBalanceType;
  allHolidays: Holiday[];
  workingDays: daysTypes[];
  blockingLeaveRequests: MyLeaveRequestPayloadType[];
  minDate: Date;
  maxDate: Date;
}

const PolicyLeaveDateSection: FC<Props> = ({
  policyBalance,
  allHolidays,
  workingDays,
  blockingLeaveRequests,
  minDate,
  maxDate
}) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "applyPolicyLeaveModal"
  );
  const translateAria = useTranslator("leaveAria", "applyLeave");

  const { selectedDates, formErrors, setSelectedDates, setSelectedMonth } =
    usePolicyLeaveStore(
      useShallow((state) => ({
        selectedDates: state.selectedDates,
        formErrors: state.formErrors,
        setSelectedDates: state.setSelectedDates,
        setSelectedMonth: state.setSelectedMonth
      }))
    );

  const dateFieldRef = useRef<HTMLFieldSetElement>(null);

  const dateError = formErrors?.selectedDates;
  const hasDateError = Boolean(dateError);

  useEffect(() => {
    if (hasDateError) {
      dateFieldRef.current?.focus();
    }
  }, [hasDateError]);

  return (
    <div className="flex flex-col gap-3">
      <fieldset
        ref={dateFieldRef}
        tabIndex={-1}
        aria-label={translateAria(["calendar", "selectDateForLeave"])}
        className={
          dateError
            ? "min-w-0 rounded-lg border border-semantic-red-accent"
            : "min-w-0"
        }
      >
        <CalendarDateRangePicker
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
          setSelectedMonth={setSelectedMonth}
          allowedDuration={policyBalance.leaveType.minDuration}
          allHolidays={allHolidays}
          minDate={minDate}
          maxDate={maxDate}
          workingDays={workingDays}
          myLeaveRequests={blockingLeaveRequests}
          error={dateError}
        />
      </fieldset>
      <div className="flex flex-row items-center gap-2">
        <p>
          {translateText(["myPolicyBalance"], {
            policyName: policyBalance.policyName
          })}
        </p>
        <PolicyLeaveBalanceCard policyBalance={policyBalance} />
      </div>
    </div>
  );
};

export default PolicyLeaveDateSection;
