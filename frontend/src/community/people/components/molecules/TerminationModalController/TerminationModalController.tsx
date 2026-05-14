import { FC } from "react";

import { usePeopleStore } from "~community/people/store/store";
import { SupervisorReassignmentActionType } from "~community/people/types/PeopleTypes";
import { concatStrings } from "~community/people/utils/jobFamilyUtils/commonUtils";

import SupervisorReassignmentModal from "../SupervisorReassignmentModal/SupervisorReassignmentModal";
import TerminateConfirmationModal from "../TerminateConfirmationModal/TerminateConfirmationModal";

const TerminationModalController: FC = () => {
  const {
    isTerminationConfirmationModalOpen,
    setTerminationConfirmationModalOpen,
    selectedEmployeeId,
    isSupervisorReassignmentModalOpen,
    supervisorReassignmentActionType,
    setIsSupervisorReassignmentModalOpen,
    employee
  } = usePeopleStore((state) => state);

  const employeeName = concatStrings([
    employee?.personal?.general?.firstName ?? "",
    employee?.personal?.general?.lastName ?? ""
  ]).trim();

  return (
    <>
      <SupervisorReassignmentModal
        isOpen={
          isSupervisorReassignmentModalOpen &&
          supervisorReassignmentActionType === "terminate"
        }
        onCancel={() => setIsSupervisorReassignmentModalOpen(false)}
        employeeId={Number(selectedEmployeeId)}
        employeeName={employeeName}
        actionType={SupervisorReassignmentActionType.TERMINATE}
        onActionSuccess={() => setIsSupervisorReassignmentModalOpen(false)}
      />
      <TerminateConfirmationModal
        isOpen={isTerminationConfirmationModalOpen}
        onClose={() => setTerminationConfirmationModalOpen(false)}
      />
    </>
  );
};

export default TerminationModalController;
