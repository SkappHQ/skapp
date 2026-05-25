import { FC } from "react";

import SupervisorReassignmentModal from "~community/people/components/organisms/SupervisorReassignmentModal/SupervisorReassignmentModal";
import { usePeopleStore } from "~community/people/store/store";
import { SupervisorReassignmentActionType } from "~community/people/types/PeopleTypes";

import TerminateConfirmationModal from "../TerminateConfirmationModal/TerminateConfirmationModal";

const TerminationModalController: FC = () => {
  const {
    isTerminationConfirmationModalOpen,
    setTerminationConfirmationModalOpen,
    selectedEmployeeId,
    isSupervisorReassignmentModalOpen,
    supervisorReassignmentActionType,
    setIsSupervisorReassignmentModalOpen,
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
