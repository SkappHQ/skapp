import { FC, useEffect, useMemo, useState } from "react";

import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetLeaveTypes } from "~community/leave/api/LeaveApi";
import UserAssignedLeaveTypes from "~community/leave/components/molecules/UserAssignedLeaveTypes/UserAssignedLeaveTypes";
import UserLeaveHistory from "~community/leave/components/molecules/UserLeaveHistory/UserLeaveHistory";
import UserLeavePolicies from "~community/leave/components/molecules/UserLeavePolicies/UserLeavePolicies";
import UserLeaveUtilization from "~community/leave/components/molecules/UserLeaveUtilization/UserLeaveUtilization";
import { USER_ASSIGNED_LEAVE_TYPES_PAGE_SIZE } from "~community/leave/constants/leavePolicyConstants";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveType } from "~community/leave/types/CustomLeaveAllocationTypes";
import UpgradeOverlay from "~enterprise/common/components/molecules/UpgradeOverlay/UpgradeOverlay";
import useTier from "~enterprise/common/hooks/useTier";
import leaveTypesMockData from "~enterprise/leave/data/leaveTypesMockData.json";

import styles from "./styles";

interface Props {
  selectedUser: number;
  employeeLastName?: string;
  employeeFirstName?: string;
}

const IndividualEmployeeLeaveReportSection: FC<Props> = ({
  selectedUser,
  employeeLastName,
  employeeFirstName
}) => {
  const classes = styles();

  const translateText = useTranslator(
    "peopleModule",
    "individualLeaveAnalytics"
  );

  const { isAtLeastCoreTier } = useTier();

  const { isLeavePoliciesEnabled, isLoading: isLeavePolicyConfigLoading } =
    useLeavePoliciesEnabled();

  const employeeName = [employeeFirstName, employeeLastName]
    .filter(Boolean)
    .join(" ");

  const { resetLeaveRequestParams } = useLeaveStore((state) => state);

  const [leaveTypesList, setLeaveTypesList] = useState<LeaveType[]>([]);

  const { data: leaveTypesData, isLoading: leaveTypeIsLoading } =
    useGetLeaveTypes({
      filterByInUse: isAtLeastCoreTier,
      employeeId: isAtLeastCoreTier ? selectedUser : undefined,
      enabled: isAtLeastCoreTier
    });

  const leaveTypes = useMemo(() => {
    return isAtLeastCoreTier ? leaveTypesData : leaveTypesMockData;
  }, [isAtLeastCoreTier, leaveTypesData]);

  useEffect(() => {
    if (leaveTypes && !leaveTypeIsLoading) setLeaveTypesList(leaveTypes);
  }, [leaveTypes, leaveTypeIsLoading]);

  useEffect(() => {
    resetLeaveRequestParams();
  }, []);

  return (
    <PeopleLayout
      title={""}
      showDivider={false}
      containerStyles={classes.container}
      pageHead={translateText(["pageHead"])}
    >
      <UpgradeOverlay customContainerStyles={classes.customContainerStyles}>
        <>
          <h2 className="h2 text-black">{translateText(["pageHead"])}</h2>

          {!isLeavePolicyConfigLoading &&
            (isLeavePoliciesEnabled ? (
              <UserLeavePolicies
                employeeId={selectedUser}
                employeeName={employeeName}
              />
            ) : (
              <UserAssignedLeaveTypes
                employeeId={selectedUser}
                pageSize={USER_ASSIGNED_LEAVE_TYPES_PAGE_SIZE}
              />
            ))}

          {leaveTypesList?.length > 0 && (
            <UserLeaveUtilization
              employeeId={selectedUser}
              leaveTypesList={leaveTypesList}
            />
          )}

          <UserLeaveHistory
            employeeId={selectedUser}
            leaveTypesList={leaveTypesList}
            employeeLastName={employeeLastName}
            employeeFirstName={employeeFirstName}
          />
        </>
      </UpgradeOverlay>
    </PeopleLayout>
  );
};

export default IndividualEmployeeLeaveReportSection;
