import { FC } from "react";

import SupervisorReassignmentModal from "~community/people/components/organisms/SupervisorReassignmentModal/SupervisorReassignmentModal";
import { usePeopleStore } from "~community/people/store/store";
import { SupervisorReassignmentActionType } from "~community/people/types/PeopleTypes";

import UserDeletionConfirmationModal from "../UserDeletionConfirmationModal/UserDeletionConfirmationModal";

const UserDeletionModalController: FC = () => {
  const {
    isDeletionConfirmationModalOpen,
    setDeletionConfirmationModalOpen,
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
            SupervisorReassignmentActionType.DELETE
        }
        onCancel={() => setIsSupervisorReassignmentModalOpen(false)}
        employeeId={Number(selectedEmployeeId)}
        actionType={SupervisorReassignmentActionType.DELETE}
        onActionSuccess={() => setIsSupervisorReassignmentModalOpen(false)}
      />
      <UserDeletionConfirmationModal
        isOpen={isDeletionConfirmationModalOpen}
        onClose={() => setDeletionConfirmationModalOpen(false)}
        employeeId={Number(selectedEmployeeId)}
      />
    </>
  );
};

export default UserDeletionModalController;
