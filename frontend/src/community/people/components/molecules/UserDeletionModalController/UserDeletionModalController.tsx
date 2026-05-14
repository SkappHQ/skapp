import { FC } from "react";

import { usePeopleStore } from "~community/people/store/store";
import { SupervisorReassignmentActionType } from "~community/people/types/PeopleTypes";
import { concatStrings } from "~community/people/utils/jobFamilyUtils/commonUtils";

import SupervisorReassignmentModal from "../SupervisorReassignmentModal/SupervisorReassignmentModal";
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

  const employeeName = concatStrings([
    employee?.personal?.general?.firstName ?? "",
    employee?.personal?.general?.lastName ?? ""
  ]).trim();

  return (
    <>
      <SupervisorReassignmentModal
        isOpen={
          isSupervisorReassignmentModalOpen &&
          supervisorReassignmentActionType === "delete"
        }
        onCancel={() => setIsSupervisorReassignmentModalOpen(false)}
        employeeId={Number(selectedEmployeeId)}
        employeeName={employeeName}
        actionType={SupervisorReassignmentActionType.DELETE}
        onActionSuccess={() => setIsSupervisorReassignmentModalOpen(false)}
      />
      <UserDeletionConfirmationModal
        isOpen={isDeletionConfirmationModalOpen}
        onClose={() => setDeletionConfirmationModalOpen(false)}
      />
    </>
  );
};

export default UserDeletionModalController;
