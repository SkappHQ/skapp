import { FC } from "react";

import SupervisorReassignmentModal from "~community/people/components/organisms/SupervisorReassignmentModal/SupervisorReassignmentModal";
import { usePeopleStore } from "~community/people/store/store";
import { SupervisorReassignmentActionType } from "~community/people/types/PeopleTypes";
import { concatStrings } from "~community/people/utils/jobFamilyUtils/commonUtils";

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

  return (
    <>
      <SupervisorReassignmentModal
        isOpen={
          isSupervisorReassignmentModalOpen &&
          supervisorReassignmentActionType ===
            SupervisorReassignmentActionType.TERMINATE
        }
        onCancel={() => setIsSupervisorReassignmentModalOpen(false)}
        employeeId={Number(selectedEmployeeId)}
        employeeName={
          concatStrings(
            [
              employee?.personal?.general?.firstName,
              employee?.personal?.general?.lastName
            ].filter((s): s is string => Boolean(s))
          ).trim() || undefined
        }
        actionType={SupervisorReassignmentActionType.TERMINATE}
        onActionSuccess={() => setIsSupervisorReassignmentModalOpen(false)}
      />
      <TerminateConfirmationModal
        isOpen={isTerminationConfirmationModalOpen}
        onClose={() => setTerminationConfirmationModalOpen(false)}
        employeeId={Number(selectedEmployeeId)}
      />
    </>
  );
};

export default TerminationModalController;
