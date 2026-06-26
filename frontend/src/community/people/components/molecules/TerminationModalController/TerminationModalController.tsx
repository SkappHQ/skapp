import { FC } from "react";

import SupervisorReassignmentModal from "~community/people/components/organisms/SupervisorReassignmentModal/SupervisorReassignmentModal";
import { usePeopleStore } from "~community/people/store/store";
import { EmployeeRemoveAction } from "~community/people/types/PeopleTypes";

import ReactivateConfirmationModal from "../ReactivateConfirmationModal/ReactivateConfirmationModal";
import TerminateConfirmationModal from "../TerminateConfirmationModal/TerminateConfirmationModal";

const TerminationModalController: FC = () => {
  const {
    isTerminationConfirmationModalOpen,
    setTerminationConfirmationModalOpen,
    isReactivationConfirmationModalOpen,
    setReactivationConfirmationModalOpen,
    selectedEmployeeId,
    isSupervisorReassignmentModalOpen,
    supervisorReassignmentActionType,
    setIsSupervisorReassignmentModalOpen
  } = usePeopleStore((state) => state);

  return (
    <>
      <SupervisorReassignmentModal
        isOpen={
          isSupervisorReassignmentModalOpen &&
          supervisorReassignmentActionType === EmployeeRemoveAction.TERMINATE
        }
        onCancel={() => setIsSupervisorReassignmentModalOpen(false)}
        employeeId={Number(selectedEmployeeId)}
        actionType={EmployeeRemoveAction.TERMINATE}
        onActionSuccess={() => setIsSupervisorReassignmentModalOpen(false)}
      />
      <TerminateConfirmationModal
        isOpen={isTerminationConfirmationModalOpen}
        onClose={() => setTerminationConfirmationModalOpen(false)}
        employeeId={Number(selectedEmployeeId)}
      />
      <ReactivateConfirmationModal
        isOpen={isReactivationConfirmationModalOpen}
        onClose={() => setReactivationConfirmationModalOpen(false)}
        employeeId={Number(selectedEmployeeId)}
      />
    </>
  );
};

export default TerminationModalController;
