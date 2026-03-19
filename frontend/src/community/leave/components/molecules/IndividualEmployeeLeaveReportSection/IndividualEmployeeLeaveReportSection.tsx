import { FC, useEffect, useMemo, useState } from "react";

import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetLeaveTypes } from "~community/leave/api/LeaveApi";
import UserAssignedLeaveTypes from "~community/leave/components/molecules/UserAssignedLeaveTypes/UserAssignedLeaveTypes";
import UserLeaveHistory from "~community/leave/components/molecules/UserLeaveHistory/UserLeaveHistory";
import UserLeaveUtilization from "~community/leave/components/molecules/UserLeaveUtilization/UserLeaveUtilization";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveType } from "~community/leave/types/CustomLeaveAllocationTypes";
import UpgradeOverlay from "~enterprise/common/components/molecules/UpgradeOverlay/UpgradeOverlay";
import leaveTypesMockData from "~enterprise/leave/data/leaveTypesMockData.json";

import styles from "./styles";
import useTier from "~enterprise/common/hooks/useTier";

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

  const { isCoreTier } = useTier();

  const { resetLeaveRequestParams } = useLeaveStore((state) => state);

  const [leaveTypesList, setLeaveTypesList] = useState<LeaveType[]>([]);

  const { data: leaveTypesData, isLoading: leaveTypeIsLoading } =
    useGetLeaveTypes(isCoreTier);

  const leaveTypes = useMemo(() => {
    return isCoreTier ? leaveTypesData : leaveTypesMockData;
  }, [isCoreTier, leaveTypesData]);

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
          <UserAssignedLeaveTypes employeeId={selectedUser} pageSize={8} />

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
